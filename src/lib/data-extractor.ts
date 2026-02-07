import type { ParsedResumeData } from "@/types";

// Known hospitals in the Philippines (partial list)
const KNOWN_HOSPITALS = [
  "St. Luke's Medical Center",
  "St. Luke's",
  "Makati Medical Center",
  "The Medical City",
  "Philippine General Hospital",
  "PGH",
  "Philippine Heart Center",
  "National Kidney Institute",
  "Veterans Memorial Medical Center",
  "East Avenue Medical Center",
  "Quezon City General Hospital",
  "Manila Doctors Hospital",
  "Asian Hospital",
  "Cardinal Santos Medical Center",
  "Chong Hua Hospital",
  "Cebu Doctors",
  "Cebu Doctors' University Hospital",
  "Vicente Sotto Memorial Medical Center",
  "Davao Doctors Hospital",
  "Southern Philippines Medical Center",
  "Baguio General Hospital",
  "Jose B. Lingad Memorial",
  "Ospital ng Maynila",
  "UP-PGH",
  "UST Hospital",
  "FEU-NRMF Medical Center",
];

// Common nursing skills keywords
const SKILL_KEYWORDS = [
  "Patient Assessment",
  "IV Therapy",
  "Medication Administration",
  "Wound Care",
  "Vital Signs",
  "Patient Education",
  "Critical Care",
  "Emergency Response",
  "Infection Control",
  "Documentation",
  "Perioperative Nursing",
  "Geriatric Care",
  "Pediatric Nursing",
  "Obstetric Nursing",
  "Psychiatric Nursing",
  "Surgical Nursing",
  "Cardiac Monitoring",
  "Ventilator Management",
  "Hemodynamic Monitoring",
  "Tracheostomy Care",
  "Blood Transfusion",
  "Catheterization",
  "CPR",
  "BLS",
  "ACLS",
  "Sterile Technique",
  "Chemotherapy Administration",
  "Dialysis",
  "Triage",
  "Health Assessment",
  "Care Planning",
  "Discharge Planning",
  "Patient Advocacy",
  "Clinical Documentation",
  "EHR",
  "Electronic Health Records",
  "Telemetry",
];

export function extractResumeData(text: string): ParsedResumeData {
  const result: ParsedResumeData = {};

  result.summary = extractSummary(text);
  result.graduation_year = extractGraduationYear(text);
  result.certifications = extractCertifications(text);
  result.hospitals = extractHospitals(text);
  result.skills = extractSkills(text);
  result.salary = extractSalary(text);
  result.experience = extractExperience(text);
  result.education = extractEducation(text);
  result.years_of_experience = calculateYearsOfExperience(result.experience || []);

  return result;
}

function extractSummary(text: string): string | undefined {
  // Look for PROFESSIONAL SUMMARY, SUMMARY, OBJECTIVE, ABOUT ME, PROFILE sections
  // Use case-insensitive for the header, but case-sensitive boundary for next section header
  const headerPattern =
    /(?:PROFESSIONAL\s+SUMMARY|SUMMARY|CAREER\s+OBJECTIVE|OBJECTIVE|ABOUT\s+ME|PROFILE)[\s:]*/i;
  const headerMatch = headerPattern.exec(text);

  if (!headerMatch) return undefined;

  // Get text after the header
  const afterHeader = text.substring(headerMatch.index + headerMatch[0].length);

  // Find the next ALL-CAPS section header (line consisting only of uppercase letters, spaces, &)
  const nextSectionMatch = afterHeader.match(/\n([A-Z][A-Z\s&]{3,})\n/);
  const sectionText = nextSectionMatch
    ? afterHeader.substring(0, nextSectionMatch.index)
    : afterHeader.substring(0, 500);

  // Clean up: join lines, remove excess whitespace
  const summary = sectionText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (summary.length > 20) {
    return summary;
  }

  return undefined;
}

function extractGraduationYear(text: string): number | undefined {
  // Look for graduation year near education-related keywords
  const educationKeywords =
    /(?:graduat|BSN|Bachelor|Nursing|B\.S\.N|B\.S\. Nursing|degree|university|college)/i;

  const lines = text.split("\n");
  for (const line of lines) {
    if (educationKeywords.test(line)) {
      const yearMatch = line.match(/\b(19[89]\d|20[0-2]\d)\b/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        if (year >= 1980 && year <= new Date().getFullYear()) {
          return year;
        }
      }
    }
  }

  // Fallback: look for year near "graduated" keyword within a few lines
  for (let i = 0; i < lines.length; i++) {
    if (/graduat/i.test(lines[i])) {
      const searchRange = lines.slice(Math.max(0, i - 1), i + 3).join(" ");
      const yearMatch = searchRange.match(/\b(19[89]\d|20[0-2]\d)\b/);
      if (yearMatch) {
        return parseInt(yearMatch[1]);
      }
    }
  }

  return undefined;
}

function extractCertifications(
  text: string
): { type: string; number?: string; score?: string }[] {
  const certs: { type: string; number?: string; score?: string }[] = [];
  const textUpper = text.toUpperCase();

  // NCLEX
  if (/NCLEX/i.test(text)) {
    const nclex: { type: string; number?: string } = { type: "NCLEX" };
    // Try to find license number
    const ncNum = text.match(/NCLEX[\s-]*(?:RN)?[\s:]*(?:#?\s*)?(\d{6,})/i);
    if (ncNum) nclex.number = ncNum[1];
    certs.push(nclex);
  }

  // IELTS
  if (/IELTS/i.test(text)) {
    const ielts: { type: string; score?: string } = { type: "IELTS" };
    // Try to find score
    const scoreMatch = text.match(
      /IELTS[\s\S]{0,50}?(?:score|band|overall|result)?[\s:]*(\d+\.?\d*)/i
    );
    if (scoreMatch) ielts.score = scoreMatch[1];
    certs.push(ielts);
  }

  // PRC License
  if (/PRC/i.test(text) || /Professional Regulation Commission/i.test(text)) {
    const prc: { type: string; number?: string } = { type: "PRC License" };
    const prcNum = text.match(
      /PRC[\s-]*(?:License|Board|Registration)?[\s#:]*(\d{5,})/i
    );
    if (prcNum) prc.number = prcNum[1];
    certs.push(prc);
  }

  // BLS
  if (textUpper.includes("BLS") || /Basic Life Support/i.test(text)) {
    if (!certs.find((c) => c.type === "BLS")) {
      certs.push({ type: "BLS" });
    }
  }

  // ACLS
  if (textUpper.includes("ACLS") || /Advanced Cardiac Life Support/i.test(text)) {
    if (!certs.find((c) => c.type === "ACLS")) {
      certs.push({ type: "ACLS" });
    }
  }

  // OSCE
  if (/OSCE/i.test(text)) {
    certs.push({ type: "OSCE" });
  }

  // NLE (Nurse Licensure Examination)
  if (/NLE/i.test(text) || /Nurse Licensure Examination/i.test(text)) {
    if (!certs.find((c) => c.type === "NLE")) {
      certs.push({ type: "NLE" });
    }
  }

  return certs;
}

function extractHospitals(text: string): string[] {
  const found: string[] = [];

  for (const hospital of KNOWN_HOSPITALS) {
    if (text.toLowerCase().includes(hospital.toLowerCase())) {
      // Use the canonical name
      if (!found.includes(hospital)) {
        found.push(hospital);
      }
    }
  }

  // Also try to find "Hospital" or "Medical Center" mentions not in the list
  // Match proper nouns (capitalized words) followed by Hospital/Medical Center etc.
  const hospitalPattern =
    /(?:[A-Z][a-z]+(?:\s+(?:of|de|ng|and|&)\s+)?(?:[A-Z][a-z.']+\s*)*(?:Hospital|Medical Center|Health Center|Medical Centre))/g;
  const matches = text.match(hospitalPattern);
  if (matches) {
    for (const match of matches) {
      const cleaned = match.trim();
      if (
        cleaned.length > 10 &&
        cleaned.length < 80 &&
        !found.some((f) => f.toLowerCase() === cleaned.toLowerCase())
      ) {
        found.push(cleaned);
      }
    }
  }

  return found;
}

function extractSkills(text: string): string[] {
  const found: string[] = [];
  const textLower = text.toLowerCase();

  for (const skill of SKILL_KEYWORDS) {
    if (textLower.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }

  // Try to find a skills section and parse individual items
  const skillsSectionMatch = text.match(
    /(?:SKILLS|CLINICAL SKILLS|KEY SKILLS|COMPETENCIES|EXPERTISE)[\s:]*\n([\s\S]*?)(?:\n\s*\n\s*\n|\n[A-Z][A-Z\s&]{3,}\n)/i
  );
  if (skillsSectionMatch) {
    const skillsText = skillsSectionMatch[1];
    // Split bullet lines, then split each by comma
    const lines = skillsText.split(/\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      // Remove bullet prefix and category label (e.g., "Critical Care: ")
      const cleaned = line.replace(/^[•\-\*▪●◦]\s*/, "").replace(/^[A-Za-z\s]+:\s*/, "");
      const items = cleaned
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2 && s.length < 50);

      for (const item of items) {
        if (!found.some((f) => f.toLowerCase() === item.toLowerCase())) {
          found.push(item);
        }
      }
    }
  }

  return found;
}

function extractSalary(text: string): string | undefined {
  const salaryPatterns = [
    /(?:salary|compensation|pay|wage)[\s:]*(?:PHP|₱|Php)\s*[\d,]+/i,
    /(?:PHP|₱)\s*[\d,]+(?:\s*[-–]\s*(?:PHP|₱)?\s*[\d,]+)?/i,
    /(?:USD|\$)\s*[\d,]+(?:\s*[-–]\s*(?:USD|\$)?\s*[\d,]+)?/i,
  ];

  for (const pattern of salaryPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

function extractExperience(
  text: string
): { employer?: string; position?: string; start_date?: string; end_date?: string; department?: string; description?: string }[] {
  const experiences: { employer?: string; position?: string; start_date?: string; end_date?: string; department?: string; description?: string }[] = [];

  // Pattern: Date range on a line
  const dateRangePattern =
    /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*(\d{4}))\s*[-–to]+\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*(\d{4})|Present|Current)/gi;

  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = dateRangePattern.exec(line);
    if (dateMatch) {
      const entry: { employer?: string; position?: string; start_date?: string; end_date?: string; description?: string } = {};

      // Parse start date
      if (dateMatch[1] && dateMatch[2]) {
        entry.start_date = `${dateMatch[1]} ${dateMatch[2]}`;
      }

      // Parse end date
      if (dateMatch[3] && dateMatch[4]) {
        entry.end_date = `${dateMatch[3]} ${dateMatch[4]}`;
      } else if (/present|current/i.test(dateMatch[0])) {
        entry.end_date = "Present";
      }

      // Try to find job title and employer from surrounding lines
      const context = lines.slice(Math.max(0, i - 2), i + 3).join(" ");

      // Check for hospital/employer in context
      for (const hospital of KNOWN_HOSPITALS) {
        if (context.toLowerCase().includes(hospital.toLowerCase())) {
          entry.employer = hospital;
          break;
        }
      }

      // Look for common nursing position titles
      const positionMatch = context.match(
        /(Staff Nurse|Head Nurse|Charge Nurse|Nurse Supervisor|Clinical Nurse|OR Nurse|ER Nurse|ICU Nurse|Ward Nurse|Private Duty Nurse|Nurse Manager|Nurse Educator|Registered Nurse|RN|Medical.?Surgical Nurse)/i
      );
      if (positionMatch) {
        entry.position = positionMatch[1];
      }

      // Collect bullet point descriptions after the date line
      const bullets: string[] = [];
      for (let j = i + 1; j < lines.length; j++) {
        const descLine = lines[j].trim();
        // Stop if we hit a new section header, date range, or empty gap
        if (!descLine) {
          // Allow one blank line, stop on two consecutive
          if (j + 1 < lines.length && !lines[j + 1].trim()) break;
          continue;
        }
        if (/^[A-Z][A-Z\s&]{3,}$/.test(descLine)) break; // section header like "EDUCATION"
        if (dateRangePattern.test(descLine)) { dateRangePattern.lastIndex = 0; break; }
        dateRangePattern.lastIndex = 0;
        // Skip page separators like "-- 1 of 2 --" or "- 1 of 2 -"
        if (/^-+\s*\d+\s*(of|\/)\s*\d+\s*-+$/.test(descLine)) continue;
        if (/^[•\-\*▪●◦]/.test(descLine) || /^\d+[.)]\s/.test(descLine)) {
          bullets.push(descLine.replace(/^[•\-\*▪●◦]\s*/, "").trim());
        }
      }
      if (bullets.length > 0) {
        entry.description = bullets.join("\n");
      }

      if (entry.start_date) {
        experiences.push(entry);
      }

      // Reset lastIndex for global regex
      dateRangePattern.lastIndex = 0;
    }
  }

  return experiences;
}

function extractEducation(
  text: string
): { institution?: string; degree?: string; year?: number }[] {
  const education: { institution?: string; degree?: string; year?: number }[] = [];

  // First try to find the EDUCATION section, then look for details within it
  const eduSectionMatch = text.match(
    /EDUCATION[\s:]*\n([\s\S]*?)(?:\n[A-Z][A-Z\s&]{3,}\n|$)/i
  );
  const searchText = eduSectionMatch ? eduSectionMatch[1] : text;

  // Look for BSN/Bachelor of Science in Nursing
  const bsnMatch = searchText.match(
    /(?:BSN|B\.?S\.?N\.?|Bachelor\s+of\s+Science\s+in\s+Nursing)/i
  );
  if (bsnMatch) {
    const entry: { degree: string; institution?: string; year?: number } = {
      degree: "Bachelor of Science in Nursing",
    };

    // Use lines near the BSN match within the education section
    const idx = searchText.indexOf(bsnMatch[0]);
    const context = searchText.substring(
      Math.max(0, idx - 50),
      Math.min(searchText.length, idx + 200)
    );

    // Look for university/college name on its own line
    const lines = context.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (/(?:University|College|Institute|School of Nursing)/i.test(line) && line.length < 100) {
        // Clean: remove trailing commas, city info
        entry.institution = line.replace(/,\s*(Manila|Quezon|Cebu|Davao|Philippines).*$/i, "").trim();
        break;
      }
    }

    // Look for year
    const yearMatch = context.match(/\b(19[89]\d|20[0-2]\d)\b/);
    if (yearMatch) {
      entry.year = parseInt(yearMatch[1]);
    }

    education.push(entry);
  }

  return education;
}

function calculateYearsOfExperience(
  experience: { start_date?: string; end_date?: string }[]
): number | undefined {
  if (experience.length === 0) return undefined;

  let totalMonths = 0;

  for (const exp of experience) {
    if (!exp.start_date) continue;

    const start = parseMonthYear(exp.start_date);
    if (!start) continue;

    let end: Date;
    if (!exp.end_date || /present|current/i.test(exp.end_date)) {
      end = new Date();
    } else {
      const parsed = parseMonthYear(exp.end_date);
      if (!parsed) continue;
      end = parsed;
    }

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }

  return totalMonths > 0 ? Math.floor(totalMonths / 12) : undefined;
}

function parseMonthYear(dateStr: string): Date | null {
  const months: Record<string, number> = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };

  const match = dateStr.match(
    /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*)?(\d{4})/i
  );

  if (!match) return null;

  const year = parseInt(match[2]);
  const monthStr = match[1]?.toLowerCase();
  const month = monthStr ? (months[monthStr] ?? 0) : 0;

  return new Date(year, month, 1);
}
