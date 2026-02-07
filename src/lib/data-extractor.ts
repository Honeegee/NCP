import type { ParsedResumeData } from "@/types";

// Feature scoring system for resume extraction
interface ScoredCandidate {
  text: string;
  score: number;
  lineIndex: number;
}

function scorePositionCandidate(text: string, context: {
  isBeforeDate: boolean;
  distanceFromDate: number;
  hasPositionKeywords: boolean;
  startsWithCapital: boolean;
  length: number;
}): number {
  let score = 0;

  // Positive scoring
  if (context.hasPositionKeywords) score += 40; // Strong indicator
  if (context.isBeforeDate) score += 20; // Positions usually before dates
  if (context.startsWithCapital) score += 10;
  if (context.length > 10 && context.length < 60) score += 15; // Good length range

  // Distance scoring (closer to date is better)
  if (context.distanceFromDate === 1) score += 25;
  else if (context.distanceFromDate === 2) score += 15;
  else if (context.distanceFromDate === 3) score += 5;

  // Negative scoring
  if (text.toLowerCase() === 'unknown') score -= 50;
  if (text.match(/(?:Inc|LLC|Ltd|Corp|Corporation|Company)/i)) score -= 30; // Likely employer
  if (text.match(/^[\w\s]+,\s+[\w\s]+$/)) score -= 30; // Likely location
  if (context.length < 5 || context.length > 80) score -= 20; // Too short/long
  if (text.match(/^[A-Z][A-Z\s]+$/)) score -= 15; // All caps (might be header)

  return score;
}

function scoreEmployerCandidate(text: string, context: {
  isBeforeDate: boolean;
  distanceFromDate: number;
  hasCompanyKeywords: boolean;
  length: number;
  isKnownHospital: boolean;
}): number {
  let score = 0;

  // Positive scoring
  if (context.isKnownHospital) score += 50; // Very strong indicator
  if (context.hasCompanyKeywords) score += 35; // Strong indicator
  if (context.isBeforeDate) score += 20;
  if (context.length > 5 && context.length < 100) score += 10;

  // Distance scoring
  if (context.distanceFromDate === 1) score += 20;
  else if (context.distanceFromDate === 2) score += 10;
  else if (context.distanceFromDate === 3) score += 5;

  // Negative scoring
  if (text.toLowerCase() === 'unknown') score -= 50;
  if (text.match(/^[\w\s]+,\s+[\w\s]+$/)) score -= 30; // Likely location
  if (text.match(/(Manager|Director|Engineer|Developer|Analyst|Specialist|Coordinator|Assistant|Technician|Supervisor)/i)) score -= 25; // Likely position
  if (context.length < 3 || context.length > 150) score -= 20;

  return score;
}

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
  result.address = extractAddress(text);

  return result;
}

function extractSummary(text: string): string | undefined {
  // Look for various summary section headers
  const headerPattern =
    /(?:PROFESSIONAL\s+SUMMARY|CAREER\s+SUMMARY|EXECUTIVE\s+SUMMARY|SUMMARY|CAREER\s+OBJECTIVE|OBJECTIVE|ABOUT\s+ME|PROFILE|PERSONAL\s+STATEMENT|OVERVIEW)[\s:]*/i;
  const headerMatch = headerPattern.exec(text);

  if (!headerMatch) return undefined;

  // Get text after the header
  const afterHeader = text.substring(headerMatch.index + headerMatch[0].length);

  // Find the next ALL-CAPS section header (line consisting only of uppercase letters, spaces, &)
  const nextSectionMatch = afterHeader.match(/\n([A-Z][A-Z\s&]{3,})\n/);
  const sectionText = nextSectionMatch
    ? afterHeader.substring(0, nextSectionMatch.index)
    : afterHeader.substring(0, 600); // Increased from 500 to capture more

  // Clean up: join lines, remove excess whitespace
  const summary = sectionText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.match(/^[A-Z\s&]{4,}$/)) // Remove any accidental section headers
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (summary.length > 20 && summary.length < 1500) {
    return summary;
  }

  return undefined;
}

function extractGraduationYear(text: string): number | undefined {
  // Look for graduation year near education-related keywords
  const educationKeywords =
    /(?:graduat|Bachelor|Master|Doctorate|Ph\.?D|degree|diploma|university|college|B\.S|M\.S|MBA|B\.A|M\.A)/i;

  const lines = text.split("\n");
  const currentYear = new Date().getFullYear();

  for (const line of lines) {
    if (educationKeywords.test(line)) {
      const yearMatch = line.match(/\b(19[6-9]\d|20[0-2]\d)\b/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        if (year >= 1960 && year <= currentYear + 6) { // Allow future years for expected graduation
          return year;
        }
      }
    }
  }

  // Fallback: look for year near "graduated" keyword within a few lines
  for (let i = 0; i < lines.length; i++) {
    if (/graduat/i.test(lines[i])) {
      const searchRange = lines.slice(Math.max(0, i - 1), i + 3).join(" ");
      const yearMatch = searchRange.match(/\b(19[6-9]\d|20[0-2]\d)\b/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        if (year >= 1960 && year <= currentYear + 6) {
          return year;
        }
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

  // First, check for nursing-specific keywords (for nursing resumes)
  for (const skill of SKILL_KEYWORDS) {
    if (textLower.includes(skill.toLowerCase())) {
      if (!found.some((f) => f.toLowerCase() === skill.toLowerCase())) {
        found.push(skill);
      }
    }
  }

  // Try to find a skills section and parse individual items
  const skillsSectionMatch = text.match(
    /(?:SKILLS|TECHNICAL SKILLS|PROFESSIONAL SKILLS|CORE COMPETENCIES|CLINICAL SKILLS|KEY SKILLS|COMPETENCIES|EXPERTISE|CORE SKILLS|TECHNOLOGIES|PROFICIENCIES)[\s:]*\n([\s\S]*?)(?:\n\s*\n\s*\n|\n[A-Z][A-Z\s&]{3,}\n|$)/i
  );

  if (skillsSectionMatch) {
    const skillsText = skillsSectionMatch[1];
    // Split bullet lines, then split each by comma/semicolon
    const lines = skillsText.split(/\n/).map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
      // Skip if line looks like a section header
      if (line.match(/^[A-Z][A-Z\s&]{3,}$/)) continue;

      // Remove bullet prefix
      const cleaned = line.replace(/^[•\-\*▪●◦➤→]\s*/, "").replace(/^\d+[.)]\s*/, "");

      // Check if line has a category label (e.g., "Programming: Python, Java, C++")
      const categoryMatch = cleaned.match(/^([A-Za-z\s&]+?):\s*(.+)$/);
      if (categoryMatch) {
        // Extract skills from the category
        const skillsPart = categoryMatch[2];
        const items = skillsPart
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && s.length < 60);

        for (const item of items) {
          if (!found.some((f) => f.toLowerCase() === item.toLowerCase())) {
            found.push(item);
          }
        }
      } else {
        // No category, split by comma/semicolon
        const items = cleaned
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && s.length < 60);

        for (const item of items) {
          // Skip if it's too generic or looks like a sentence
          if (item.split(/\s+/).length > 6) continue; // Skip long sentences
          if (!found.some((f) => f.toLowerCase() === item.toLowerCase())) {
            found.push(item);
          }
        }
      }
    }
  }

  // Also look for common technical skills patterns anywhere in resume
  const techSkillPatterns = [
    // Programming languages
    /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Swift|Kotlin|Go|Rust|SQL|HTML|CSS|React|Vue|Angular|Node\.js|Django|Flask|Spring|\.NET)\b/gi,
    // Tools and platforms
    /\b(?:Git|Docker|Kubernetes|AWS|Azure|GCP|Jenkins|CI\/CD|Jira|Agile|Scrum)\b/gi,
  ];

  for (const pattern of techSkillPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const skill = match[0];
      if (!found.some((f) => f.toLowerCase() === skill.toLowerCase())) {
        found.push(skill);
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
): { employer?: string; position?: string; start_date?: string; end_date?: string; department?: string; description?: string; location?: string }[] {
  const experiences: { employer?: string; position?: string; start_date?: string; end_date?: string; department?: string; description?: string; location?: string }[] = [];

  // First, identify and exclude the EDUCATION section from experience parsing
  // Find where EDUCATION starts and where it ends (next major section)
  const educationStartMatch = text.match(/\n(EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND)[\s:]*\n/i);
  let experienceText = text;

  if (educationStartMatch) {
    const educationStart = educationStartMatch.index || 0;
    const afterEducation = text.substring(educationStart);

    // Find the next major section header (all caps, at least 10 chars)
    const nextSectionMatch = afterEducation.substring(educationStartMatch[0].length).match(/\n([A-Z][A-Z\s&]{9,})\n/);

    if (nextSectionMatch && nextSectionMatch.index !== undefined) {
      const educationEnd = educationStart + educationStartMatch[0].length + nextSectionMatch.index;
      // Remove the education section
      experienceText = text.substring(0, educationStart) + '\n\n' + text.substring(educationEnd);
    }
  }

  // Pattern: Date range on a line - handles both "Month Year - Month Year" and "Year - Year"
  // Updated to handle both formats:
  // 1. Month Year - Month Year (e.g., "March 2023 - October 2023")
  // 2. Year - Year (e.g., "2016 - 2018")
  const dateRangePattern =
    /(?:(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*)?(\d{4}))\s*[-–—to]+\s*(?:((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*)?(\d{4})|Present|Current)/gi;

  const lines = experienceText.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = dateRangePattern.exec(line);
    if (dateMatch) {
      const entry: { employer?: string; position?: string; start_date?: string; end_date?: string; description?: string; location?: string } = {};

      // Parse start date
      if (dateMatch[1] && dateMatch[2]) {
        // Has month and year
        entry.start_date = `${dateMatch[1]} ${dateMatch[2]}`;
      } else if (dateMatch[2]) {
        // Year only
        entry.start_date = `January ${dateMatch[2]}`;
      }

      // Parse end date
      if (/present|current/i.test(dateMatch[0])) {
        entry.end_date = "Present";
      } else if (dateMatch[3] && dateMatch[4]) {
        // Has month and year
        entry.end_date = `${dateMatch[3]} ${dateMatch[4]}`;
      } else if (dateMatch[4]) {
        // Year only
        entry.end_date = `December ${dateMatch[4]}`;
      }

      // Use feature scoring to find the best position candidate
      // Look at 3 lines before the date
      const beforeLines = lines.slice(Math.max(0, i - 3), i);
      const positionCandidates: ScoredCandidate[] = [];

      // Collect all potential position candidates
      for (let j = 0; j < beforeLines.length; j++) {
        const candidateLine = beforeLines[j].trim();
        if (!candidateLine || candidateLine.length < 3) continue;
        if (candidateLine.match(/^[A-Z\s&]{4,}$/)) continue; // section header
        if (candidateLine.match(/^[\d\s\-•\*]+$/)) continue; // just numbers/bullets
        if (candidateLine.toLowerCase().includes('page ')) continue;
        if (candidateLine.match(/^-+\s*\d+/)) continue; // page number

        let textToScore = candidateLine;
        let extractedLocation = '';

        // Check if line has pipe separator (Position | Location format)
        if (candidateLine.includes('|')) {
          const parts = candidateLine.split('|').map(p => p.trim());
          textToScore = parts[0];
          extractedLocation = parts[1] || '';
        }

        // Skip obvious locations
        if (textToScore.match(/^[\w\s]+,\s+[\w\s]+(?:,\s+[\w\s]+)?$/)) continue;
        // Skip person names
        if (textToScore.match(/^(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[\w\s]+$/) && textToScore.split(/\s+/).length <= 4) continue;

        const hasPositionKeywords = textToScore.match(/(Manager|Director|Engineer|Developer|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior|Consultant|Officer|Administrator|Executive|Supervisor|Head|Chief|Technician|Translator|Owner|Crew|Nurse|RN|Staff|Clerk|Admin|Sorting|Control|Treatment|Process|Testing)/i) !== null;

        const score = scorePositionCandidate(textToScore, {
          isBeforeDate: true,
          distanceFromDate: beforeLines.length - j,
          hasPositionKeywords,
          startsWithCapital: /^[A-Z][a-z]/.test(textToScore),
          length: textToScore.length,
        });

        positionCandidates.push({
          text: textToScore,
          score,
          lineIndex: j,
        });

        // Store location if found from pipe
        if (extractedLocation && extractedLocation.length < 80 && !entry.location) {
          entry.location = extractedLocation;
        }
      }

      // Pick the highest scoring position
      if (positionCandidates.length > 0) {
        positionCandidates.sort((a, b) => b.score - a.score);
        if (positionCandidates[0].score > 0) {
          entry.position = positionCandidates[0].text;
        }
      }

      // If position is "Unknown" or similar placeholder, try to find real position in description area
      if (!entry.position || entry.position.toLowerCase() === 'unknown' || entry.position.toLowerCase() === 'n/a') {
        // Look in lines AFTER the date for position (first non-bullet line)
        for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
          const candidateLine = lines[j].trim();

          // Skip empty lines
          if (!candidateLine) continue;

          // Skip if it's another date or section header
          if (dateRangePattern.test(candidateLine)) { dateRangePattern.lastIndex = 0; continue; }
          if (/^[A-Z][A-Z\s&]{3,}$/.test(candidateLine)) continue;
          dateRangePattern.lastIndex = 0;

          // Skip bullet points - those are descriptions, not position
          if (/^[•\-\*▪●◦]/.test(candidateLine) || /^\d+[.)]\s/.test(candidateLine)) continue;

          // Skip if it looks like employer or location
          if (entry.employer && candidateLine === entry.employer) continue;
          if (entry.location && candidateLine === entry.location) continue;
          if (candidateLine.match(/^[\w\s]+,\s+[\w\s]+$/)) continue; // Location pattern

          // Look for position with pipe format
          if (candidateLine.includes('|')) {
            const parts = candidateLine.split('|').map(p => p.trim());
            if (parts[0].match(/(Manager|Director|Engineer|Developer|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior|Consultant|Officer|Administrator|Executive|Supervisor|Head|Chief|Technician|Translator|Owner|Crew|Nurse|RN|Staff|Clerk|Admin|Supervisor|Sorting|Control)/i)) {
              entry.position = parts[0];
              break;
            }
          }

          // Look for position keywords (expanded list)
          if (candidateLine.match(/(Manager|Director|Engineer|Developer|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior|Consultant|Officer|Administrator|Executive|Supervisor|Head|Chief|Technician|Translator|Owner|Crew|Nurse|RN|Staff|Clerk|Admin|Sorting|Control|Treatment|Process|Testing)/i) &&
              candidateLine.length < 80 &&
              !candidateLine.match(/(?:Inc|LLC|Ltd|Corp|Corporation|Company)/i)) { // Not a company name
            entry.position = candidateLine;
            break;
          }

          // If line starts with capital and looks like a job title (not too long, not all caps)
          if (candidateLine.match(/^[A-Z][a-z]/) &&
              candidateLine.length > 5 &&
              candidateLine.length < 80 &&
              candidateLine.split(/\s+/).length <= 6 && // Not too many words
              !candidateLine.match(/^[A-Z][A-Z\s]+$/)) { // Not all caps
            entry.position = candidateLine;
            break;
          }
        }
      }

      // Use feature scoring to find the best employer candidate
      const employerCandidates: ScoredCandidate[] = [];

      // Collect all potential employer candidates
      for (let j = 0; j < beforeLines.length; j++) {
        const candidateLine = beforeLines[j].trim();
        if (!candidateLine || candidateLine.length < 3) continue;
        if (entry.position && candidateLine === entry.position) continue; // Skip if already position

        // Skip if line has pipe with position keywords (already handled as position | location)
        if (candidateLine.includes('|')) {
          const parts = candidateLine.split('|').map(p => p.trim());
          if (parts[0].match(/(Manager|Director|Engineer|Developer|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior|Consultant|Officer|Administrator|Executive|Supervisor|Head|Chief|Technician|Translator|Owner|Crew|Nurse|RN|Staff|Clerk|Admin)/i)) {
            continue;
          }
        }

        if (candidateLine.match(/^[A-Z\s&]{4,}$/)) continue; // section header
        if (candidateLine.match(/^[\d\s\-•\*]+$/)) continue; // just numbers/bullets
        if (candidateLine.toLowerCase().includes('page ')) continue;

        const textToScore = candidateLine.split('|')[0].trim();

        // Check if it's a known hospital
        const isKnownHospital = KNOWN_HOSPITALS.some(h =>
          textToScore.toLowerCase().includes(h.toLowerCase())
        );

        const hasCompanyKeywords = textToScore.match(/(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.|Group|Technologies|Solutions|Services|Hospital|Medical|University|College|Institute|Agency|Organization|Foundation|Association|Department|Center|Foods|Energy)/i) !== null;

        const score = scoreEmployerCandidate(textToScore, {
          isBeforeDate: true,
          distanceFromDate: beforeLines.length - j,
          hasCompanyKeywords,
          length: textToScore.length,
          isKnownHospital,
        });

        employerCandidates.push({
          text: textToScore,
          score,
          lineIndex: j,
        });

        // Extract location if line has pipe and we don't have location yet
        if (candidateLine.includes('|') && !entry.location) {
          const parts = candidateLine.split('|').map(p => p.trim());
          if (parts[1] && parts[1].length < 80) {
            entry.location = parts[1];
          }
        }
      }

      // Pick the highest scoring employer
      if (employerCandidates.length > 0) {
        employerCandidates.sort((a, b) => b.score - a.score);
        if (employerCandidates[0].score > 0) {
          entry.employer = employerCandidates[0].text;
        }
      }

      // Check if employer is embedded in position (various formats)
      if (entry.position && !entry.employer) {
        // Format: Position (Employer)
        const parenMatch = entry.position.match(/^(.+?)\s*\((.+?)\)\s*$/);
        if (parenMatch) {
          entry.employer = parenMatch[2].trim();
          entry.position = parenMatch[1].trim();
        }

        // Format: Position at Employer
        const atMatch = entry.position.match(/^(.+?)\s+at\s+(.+)$/i);
        if (atMatch) {
          entry.position = atMatch[1].trim();
          entry.employer = atMatch[2].trim();
        }

        // Format: Position - Employer (with dash separator)
        const dashMatch = entry.position.match(/^(.+?)\s+[-–—]\s+(.+)$/);
        if (dashMatch && dashMatch[2].length > 10) {
          // Check if second part looks like a company
          if (dashMatch[2].match(/(?:Inc|LLC|Ltd|Corp|Hospital|Medical|Center|Company|Group)/i)) {
            entry.position = dashMatch[1].trim();
            entry.employer = dashMatch[2].trim();
          }
        }
      }

      // Fallback: if we have position but no employer, look more carefully at all lines
      if (entry.position && !entry.employer) {
        // Try all lines before the date, not just the last one
        for (let j = beforeLines.length - 1; j >= 0; j--) {
          const possibleEmployer = beforeLines[j].trim();

          // Skip empty lines
          if (!possibleEmployer) continue;

          // Skip if this is the position line
          if (possibleEmployer === entry.position) continue;

          // Skip if line has pipe with position keywords (it's position | location)
          let skipLine = false;
          if (possibleEmployer.includes('|')) {
            const parts = possibleEmployer.split('|').map(p => p.trim());
            if (parts[0].match(/(Manager|Director|Engineer|Developer|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior|Consultant|Officer|Administrator|Executive|Supervisor|Head|Chief|Technician|Translator|Owner|Crew|Nurse|RN|Staff|Clerk|Admin)/i)) {
              skipLine = true;
            }
          }

          if (skipLine) continue;

          // Don't use it if it looks like a location or placeholder
          if (possibleEmployer.match(/^[\w\s]+,\s+[\w\s]+$/)) continue; // "City, Country"
          if (possibleEmployer.toLowerCase() === 'unknown') continue;
          if (possibleEmployer.length < 3) continue;

          // If it has pipe (and we got here), treat as employer | location
          if (possibleEmployer.includes('|')) {
            const parts = possibleEmployer.split('|').map(p => p.trim());
            entry.employer = parts[0];
            if (!entry.location && parts[1] && parts[1].length < 80) {
              entry.location = parts[1];
            }
            break;
          }

          // Otherwise, use as employer if it looks like a company/organization
          if (possibleEmployer.match(/(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.|Group|Technologies|Solutions|Services|Hospital|Medical|University|College|Institute|Agency|Organization|Foundation|Association|Department|Center|Foods)/i) ||
              possibleEmployer.match(/^[A-Z][\w\s&,'.-]{2,}$/)) {
            entry.employer = possibleEmployer;
            break;
          }
        }
      }

      // Clean up employer if it exists - remove pipe and location (if not already handled)
      if (entry.employer && entry.employer.includes('|')) {
        entry.employer = entry.employer.split('|')[0].trim();
      }

      // Look for location (City, State/Country pattern) in nearby lines (if not already found from pipe)
      if (!entry.location) {
        for (let j = beforeLines.length - 1; j >= 0; j--) {
          const candidateLine = beforeLines[j].trim();

          // Skip if it's the position or employer
          if ((entry.position && candidateLine === entry.position) ||
              (entry.employer && candidateLine === entry.employer)) continue;

          // Match location patterns like "Manila, Philippines" or "New York, USA"
          if (candidateLine.match(/^[\w\s]+,\s+[\w\s]+(?:,\s+[\w\s]+)?$/) &&
              candidateLine.length < 80) {
            entry.location = candidateLine;
            break;
          }
        }
      }

      // Also check lines after the date for location
      if (!entry.location) {
        for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
          const candidateLine = lines[j].trim();

          // Match location patterns
          if (candidateLine.match(/^[\w\s]+,\s+[\w\s]+(?:,\s+[\w\s]+)?$/) &&
              candidateLine.length < 80 &&
              !candidateLine.match(/^[•\-\*▪●◦]/) && // Not a bullet point
              !candidateLine.match(/^\d+[.)]\s/)) { // Not a numbered list
            entry.location = candidateLine;
            break;
          }
        }
      }

      // Collect bullet point descriptions after the date line
      const bullets: string[] = [];
      let emptyLineCount = 0;

      for (let j = i + 1; j < lines.length; j++) {
        const descLine = lines[j].trim();

        // Stop if we hit two consecutive empty lines
        if (!descLine) {
          emptyLineCount++;
          if (emptyLineCount >= 2) break;
          continue;
        }
        emptyLineCount = 0; // reset counter

        // Stop if we hit a new section header
        if (/^[A-Z][A-Z\s&]{3,}$/.test(descLine)) break;

        // Stop if we hit another date range
        if (dateRangePattern.test(descLine)) {
          dateRangePattern.lastIndex = 0;
          break;
        }
        dateRangePattern.lastIndex = 0;

        // Skip page separators like "-- 1 of 2 --" or "- 1 of 2 -"
        if (/^-+\s*\d+\s*(of|\/)\s*\d+\s*-+$/.test(descLine)) continue;

        // Skip lines that look like position or employer (already extracted)
        if (entry.position && descLine === entry.position) continue;
        if (entry.employer && descLine === entry.employer) continue;
        if (entry.location && descLine === entry.location) continue;

        // Skip lines that are just "Unknown" or similar placeholders
        if (descLine.toLowerCase() === 'unknown' || descLine.toLowerCase() === 'n/a') continue;

        // Capture bullet points and regular description lines
        if (/^[•\-\*▪●◦]/.test(descLine) || /^\d+[.)]\s/.test(descLine)) {
          // Has explicit bullet character - remove it
          bullets.push(descLine.replace(/^[•\-\*▪●◦]\s*/, "").replace(/^\d+[.)]\s*/, "").trim());
        } else if (descLine.length > 10 && descLine.length < 300) {
          // Line without bullet character but looks like a description
          // Skip if it looks like a section header or title
          if (!descLine.match(/^[A-Z][A-Z\s]{10,}$/)) {
            bullets.push(descLine);
          }
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
): { institution?: string; degree?: string; field_of_study?: string; year?: number; institution_location?: string; start_date?: string; end_date?: string; status?: string }[] {
  const education: { institution?: string; degree?: string; field_of_study?: string; year?: number; institution_location?: string; start_date?: string; end_date?: string; status?: string }[] = [];

  // First try to find the EDUCATION section manually
  let searchText = text;
  const educationHeaderMatch = text.match(/\n(EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND|ACADEMIC QUALIFICATIONS)[\s:]*\n/i);

  if (educationHeaderMatch && educationHeaderMatch.index !== undefined) {
    const sectionStart = educationHeaderMatch.index + educationHeaderMatch[0].length;
    const afterEducation = text.substring(sectionStart);

    // Find the next major section header (all caps, 10+ chars, on its own line)
    // Look for pattern like "\nSOFTWARE PROJECT PORTFOLIO\n" or "\nPROFESSIONAL EXPERIENCE\n"
    const lines = afterEducation.split('\n');
    let sectionEnd = afterEducation.length;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Check if line is mostly uppercase and at least 10 chars (section header)
      // Count uppercase letters vs total letters to allow for mixed case in parentheses
      const letters = line.replace(/[^a-zA-Z]/g, '');
      const upperCount = (line.match(/[A-Z]/g) || []).length;
      const upperCaseRatio = letters.length > 0 ? upperCount / letters.length : 0;

      if (line.length >= 10 &&
          upperCaseRatio > 0.7 &&  // At least 70% uppercase letters
          line.match(/^[A-Z]/) &&  // Starts with capital
          !line.match(/^\d/)) {     // Not starting with number
        // Found next section - calculate end position
        sectionEnd = lines.slice(0, i).join('\n').length;
        break;
      }
    }

    searchText = afterEducation.substring(0, sectionEnd);
  }

  // Split into lines for parsing
  const lines = searchText.split("\n").map(l => l.trim()).filter(Boolean);

  // Common degree patterns - ordered from most specific to most general
  const degreePatterns = [
    // Specific full degree names first (greedy matching)
    /Bachelor\s+of\s+Science\s+in\s+[\w\s]+/i,
    /Bachelor\s+of\s+Arts\s+in\s+[\w\s]+/i,
    /Master\s+of\s+Science\s+in\s+[\w\s]+/i,
    /Master\s+of\s+Arts\s+in\s+[\w\s]+/i,
    // Nursing degrees
    /(?:BSN|B\.?S\.?N\.?|Bachelor\s+of\s+Science\s+in\s+Nursing)/i,
    // Technical degrees
    /(?:Chemical|Mechanical|Electrical|Civil)\s+Engineering\s+Technology/i,
    // More flexible patterns (use greedy matching, not non-greedy)
    /(?:B\.?S\.?|B\.?A\.?|Bachelor(?:'s)?)\s+(?:of\s+)?(?:Science|Arts)?\s*(?:in\s+)?([A-Z][\w\s&,]+)/i,
    /(?:M\.?S\.?|M\.?A\.?|MBA|Master(?:'s)?)\s+(?:of\s+)?(?:Science|Arts|Business Administration)?\s*(?:in\s+)?([A-Z][\w\s&,]+)/i,
    // Doctorate degrees
    /(?:Ph\.?D\.?|Doctorate|Doctor)\s+(?:of\s+)?(?:Philosophy)?\s*(?:in\s+)?([A-Z][\w\s&,]+)?/i,
    // Associate degrees
    /(?:A\.?S\.?|A\.?A\.?|Associate(?:'s)?)\s+(?:of\s+)?(?:Science|Arts)?\s*(?:in\s+)?([A-Z][\w\s&,]+)/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let degreeFound = false;
    let degreeText = "";

    // Check for degree patterns
    for (const pattern of degreePatterns) {
      const match = line.match(pattern);
      if (match) {
        degreeText = match[0].trim();
        degreeFound = true;
        break;
      }
    }

    if (degreeFound && degreeText) {
      const entry: { degree: string; institution?: string; field_of_study?: string; year?: number; institution_location?: string; start_date?: string; end_date?: string; status?: string } = {
        degree: degreeText,
      };

      // Look for major/specialization (e.g., "Focus on Software Development", "Major in Computer Science")
      // Search 1-2 lines after the degree
      for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
        const candidateLine = lines[j];

        // Match lines that indicate a major/specialization
        if (candidateLine.match(/^(?:Focus on|Major in|Specialization|Concentration|Emphasis|Specializing in)[:\s]*/i)) {
          entry.field_of_study = candidateLine
            .replace(/^(?:Focus on|Major in|Specialization|Concentration|Emphasis|Specializing in)[:\s]*/i, '')
            .trim();
          break;
        }
      }

      // Look for status (e.g., "4th Year Student", "Graduated")
      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const candidateLine = lines[j];

        // Match student status patterns
        if (candidateLine.match(/^(?:1st|2nd|3rd|4th|5th)\s+Year\s+Student/i) ||
            candidateLine.match(/^(?:Freshman|Sophomore|Junior|Senior)\s+Year/i) ||
            candidateLine.match(/^(?:Graduated|Graduate|Undergraduate)/i)) {
          entry.status = candidateLine.trim();
          break;
        }
      }

      // Look for institution - search AFTER degree first (most common), then before
      // This prevents picking up institutions from previous education entries

      // First, search 1-3 lines AFTER the degree
      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const candidateLine = lines[j];

        // Look for university/college/institute indicators
        if (candidateLine.match(/(?:University|College|Institute|School|Academy|Polytechnic)/i) &&
            candidateLine.length < 150 &&
            !candidateLine.match(/^[A-Z\s&]{4,}$/)) { // not a section header
          // Clean up: remove trailing commas, city info, dates
          entry.institution = candidateLine
            .replace(/,?\s*\d{4}\s*(?:-\s*\d{4})?/g, '') // remove years
            .replace(/,\s*(?:Manila|Quezon|Cebu|Davao|Philippines|USA|UK|Canada|Australia|Singapore).*$/i, '')
            .replace(/,\s*(?:CA|NY|TX|FL)\s*$/i, '') // US states
            .trim()
            .replace(/^,\s*/, '')
            .replace(/,\s*$/, '');
          break;
        }
      }

      // If not found after, search 1-2 lines BEFORE the degree
      if (!entry.institution) {
        for (let j = Math.max(0, i - 2); j < i; j++) {
          const candidateLine = lines[j];

          // Look for university/college/institute indicators
          if (candidateLine.match(/(?:University|College|Institute|School|Academy|Polytechnic)/i) &&
              candidateLine.length < 150 &&
              !candidateLine.match(/^[A-Z\s&]{4,}$/)) { // not a section header
            // Clean up: remove trailing commas, city info, dates
            entry.institution = candidateLine
              .replace(/,?\s*\d{4}\s*(?:-\s*\d{4})?/g, '') // remove years
              .replace(/,\s*(?:Manila|Quezon|Cebu|Davao|Philippines|USA|UK|Canada|Australia|Singapore).*$/i, '')
              .replace(/,\s*(?:CA|NY|TX|FL)\s*$/i, '') // US states
              .trim()
              .replace(/^,\s*/, '')
              .replace(/,\s*$/, '');
            break;
          }
        }
      }

      // If no institution found yet, check if there's a proper noun line nearby
      // Search forward first, then backward
      if (!entry.institution) {
        // Search 1-3 lines after first
        for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
          const candidateLine = lines[j];

          // Skip lines that look like majors/specializations or status
          if (candidateLine.match(/^(?:Focus on|Major in|Specialization|4th Year|3rd Year|2nd Year|1st Year)/i)) continue;

          // Look for lines that start with capital letters and might be institution names
          if (candidateLine.match(/^[A-Z][a-z][\w\s,.-]+$/) &&
              candidateLine.length > 5 &&
              candidateLine.length < 150 &&
              !candidateLine.match(/^(?:January|February|March|April|May|June|July|August|September|October|November|December)/i) &&
              !candidateLine.match(/^\d+/)) {
            entry.institution = candidateLine
              .replace(/,?\s*\d{4}\s*(?:-\s*\d{4})?/g, '')
              .trim();
            break;
          }
        }

        // If still not found, search 1-2 lines before
        if (!entry.institution) {
          for (let j = Math.max(0, i - 2); j < i; j++) {
            const candidateLine = lines[j];

            // Skip lines that look like majors/specializations or status
            if (candidateLine.match(/^(?:Focus on|Major in|Specialization|4th Year|3rd Year|2nd Year|1st Year)/i)) continue;

            // Look for lines that start with capital letters and might be institution names
            if (candidateLine.match(/^[A-Z][a-z][\w\s,.-]+$/) &&
                candidateLine.length > 5 &&
                candidateLine.length < 150 &&
                !candidateLine.match(/^(?:January|February|March|April|May|June|July|August|September|October|November|December)/i) &&
                !candidateLine.match(/^\d+/)) {
              entry.institution = candidateLine
                .replace(/,?\s*\d{4}\s*(?:-\s*\d{4})?/g, '')
                .trim();
              break;
            }
          }
        }
      }

      // Look for graduation year and date ranges
      // Search line by line to avoid picking up dates from other entries
      let dateFound = false;
      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const candidateLine = lines[j];

        // Skip if this line looks like the start of another degree
        let isAnotherDegree = false;
        for (const pattern of degreePatterns) {
          if (candidateLine.match(pattern)) {
            isAnotherDegree = true;
            break;
          }
        }
        if (isAnotherDegree) break;

        // Try to match date range first (e.g., "2022-Present", "2007-2011")
        const dateRangeMatch = candidateLine.match(/(\d{4})\s*[-–—]\s*(?:(\d{4})|Present|Current)/i);
        if (dateRangeMatch) {
          const startYear = parseInt(dateRangeMatch[1]);
          const endYear = dateRangeMatch[2] ? parseInt(dateRangeMatch[2]) : null;

          if (startYear >= 1950 && startYear <= new Date().getFullYear() + 6) {
            entry.start_date = `${startYear}-01-01`;

            if (!endYear || /present|current/i.test(candidateLine)) {
              entry.end_date = undefined; // Currently ongoing
              entry.year = undefined; // No graduation year yet
            } else if (endYear >= 1950 && endYear <= new Date().getFullYear() + 6) {
              entry.end_date = `${endYear}-12-31`;
              entry.year = endYear; // Use end year as graduation year
            }
            dateFound = true;
            break;
          }
        }

        // Try single year if no range found
        if (!dateFound) {
          const yearMatch = candidateLine.match(/(?:Graduated|Graduation|Class of)?\s*\.?\s*(\d{4})/i);
          if (yearMatch) {
            const year = parseInt(yearMatch[1]);
            if (year >= 1950 && year <= new Date().getFullYear() + 6) {
              entry.year = year;
              dateFound = true;
              break;
            }
          }
        }
      }

      // Look for institution location (city, province/state, country)
      // Search lines near institution for location patterns
      const contextLines = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 5));
      for (const contextLine of contextLines) {
        // Match location patterns like "Talisay City, Negros Occidental" or "Manila, Philippines"
        if (contextLine.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s+(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s+)?)+$/)) {
          // Check if it contains common location keywords
          if (contextLine.match(/(?:City|Province|State|Philippines|USA|UK|Canada|Australia|Singapore|Malaysia|Quezon|Manila|Cebu|Davao|Negros|Occidental|Oriental)/i)) {
            entry.institution_location = contextLine.trim();
            break;
          }
        }
      }

      education.push(entry);
    }
  }

  return education;
}

function extractAddress(text: string): string | undefined {
  // Address is typically at the top of the resume, near contact info
  // Look for patterns like: Street, City, Province/State, Postal Code
  // Or: City, Country

  // Get the first 1500 characters (header section)
  const topSection = text.substring(0, 1500);
  const lines = topSection.split('\n').map(l => l.trim()).filter(Boolean);

  // Common address patterns
  const addressPatterns = [
    // Full address with street, city, province/state, postal code
    /^(?:[\w\s.,#-]+,\s*)?(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*(?:\d{4,5})?$/,
    // City, Province/State, Country
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/,
    // City, Country (common in Philippines)
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*(?:Philippines|USA|Canada|UK|Australia|Singapore|Malaysia)$/i,
  ];

  // Skip lines that are clearly not addresses
  const skipPatterns = [
    /^\+?\d+[\s\-\(\)]+\d+/,  // Phone numbers
    /^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/,  // Email addresses
    /^https?:\/\//i,  // URLs
    /^(?:PROFESSIONAL\s+SUMMARY|SUMMARY|OBJECTIVE|EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS)/i,  // Section headers
  ];

  // Look for address in the first 20 lines
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];

    // Skip if matches skip patterns
    if (skipPatterns.some(pattern => pattern.test(line))) continue;

    // Skip if too short or too long
    if (line.length < 10 || line.length > 150) continue;

    // Check if line matches address patterns
    for (const pattern of addressPatterns) {
      if (pattern.test(line)) {
        return line;
      }
    }

    // Fallback: Check if line contains city/province indicators
    if (line.match(/,/) &&
        line.split(',').length >= 2 &&
        line.split(',').length <= 4 &&
        !line.match(/^[A-Z\s&]+$/) && // Not all caps (section header)
        line.match(/(?:City|Quezon|Manila|Cebu|Davao|Makati|Taguig|Pasig|Philippines|Negros|Occidental)/i)) {
      return line;
    }
  }

  return undefined;
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
