const fs = require('fs');

// Read the extracted text
const text = fs.readFileSync('extracted-text.txt', 'utf-8');

function extractExperience(text) {
  const experiences = [];

  // Exclude education section
  const educationSectionMatch = text.match(
    /(?:EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND)[\s:]*\n([\s\S]*?)(?:\n(?:PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|EXPERIENCE|EMPLOYMENT HISTORY|SOFTWARE PROJECT|SKILLS|CERTIFICATIONS|[A-Z\s&]{10,})\n|$)/i
  );
  let experienceText = text;
  if (educationSectionMatch) {
    experienceText = text.replace(educationSectionMatch[0], '\n\n');
  }

  const dateRangePattern =
    /(?:(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*)?(\d{4}))\s*[-–—to]+\s*(?:((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*)?(\d{4})|Present|Current)/gi;

  const lines = experienceText.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = dateRangePattern.exec(line);

    if (dateMatch) {
      const entry = {};

      // Parse start date
      if (dateMatch[1] && dateMatch[2]) {
        entry.start_date = `${dateMatch[1]} ${dateMatch[2]}`;
      } else if (dateMatch[2]) {
        entry.start_date = `January ${dateMatch[2]}`;
      }

      // Parse end date
      if (/present|current/i.test(dateMatch[0])) {
        entry.end_date = "Present";
      } else if (dateMatch[3] && dateMatch[4]) {
        entry.end_date = `${dateMatch[3]} ${dateMatch[4]}`;
      } else if (dateMatch[4]) {
        entry.end_date = `December ${dateMatch[4]}`;
      }

      // Look for position in previous lines
      const beforeLines = lines.slice(Math.max(0, i - 3), i);
      for (let j = beforeLines.length - 1; j >= 0; j--) {
        const candidateLine = beforeLines[j].trim();
        if (candidateLine &&
            candidateLine.length > 3 &&
            candidateLine.length < 120 &&
            !candidateLine.match(/^[A-Z\s&]{4,}$/) &&
            !candidateLine.match(/^[\d\s\-•\*]+$/) &&
            !candidateLine.toLowerCase().includes('page ') &&
            !candidateLine.match(/^-+\s*\d+/)) {

          // Skip locations
          if (candidateLine.match(/^[\w\s]+,\s+[\w\s]+(?:,\s+[\w\s]+)?$/)) continue;

          // Skip person names
          if (candidateLine.match(/^(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[\w\s]+$/) && candidateLine.split(/\s+/).length <= 4) continue;

          if (candidateLine.match(/^[A-Z][a-z]/) ||
              candidateLine.match(/(Manager|Director|Engineer|Developer|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior|Consultant|Officer|Administrator|Executive|Supervisor|Head|Chief|Technician|Translator|Owner|Crew)/i)) {
            entry.position = candidateLine;
            break;
          }
        }
      }

      // Look for employer
      for (let j = beforeLines.length - 1; j >= 0; j--) {
        const candidateLine = beforeLines[j].trim();
        if (entry.position && candidateLine === entry.position) continue;

        if (candidateLine &&
            candidateLine.length > 2 &&
            candidateLine.length < 150 &&
            !candidateLine.match(/^[A-Z\s&]{4,}$/) &&
            !candidateLine.match(/^[\d\s\-•\*]+$/) &&
            !candidateLine.toLowerCase().includes('page ')) {

          if (candidateLine.match(/(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.|Group|Technologies|Solutions|Services|Hospital|Medical|University|College|Institute|Agency|Organization|Foundation|Association|Department|Center|Foods)/i) ||
              candidateLine.match(/^[A-Z][\w\s&,'.-]{2,}(?:[A-Z]|Inc|LLC|Ltd)/) ||
              (candidateLine.match(/^[A-Z]/) && !candidateLine.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)/i))) {

            let cleanedEmployer = candidateLine.split('|')[0].trim();

            if (cleanedEmployer.match(/^(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[\w\s]+$/) && entry.position && !entry.position.match(/^(?:Mr\.|Mrs\.|Ms\.|Dr\.)/)) {
              const temp = entry.position;
              entry.position = cleanedEmployer;
              cleanedEmployer = temp;
            }

            entry.employer = cleanedEmployer;
            break;
          }
        }
      }

      if (entry.position && !entry.employer && beforeLines.length > 0) {
        const possibleEmployer = beforeLines[beforeLines.length - 1].trim();
        if (possibleEmployer && possibleEmployer !== entry.position && possibleEmployer.length > 2) {
          entry.employer = possibleEmployer.split('|')[0].trim();
        }
      }

      if (entry.employer) {
        entry.employer = entry.employer.split('|')[0].trim();
      }

      if (entry.start_date) {
        experiences.push(entry);
      }

      dateRangePattern.lastIndex = 0;
    }
  }

  return experiences;
}

const experiences = extractExperience(text);

console.log('=== EXTRACTED EXPERIENCES ===');
console.log(JSON.stringify(experiences, null, 2));
console.log(`\nTotal: ${experiences.length} experiences found`);
