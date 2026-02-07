const fs = require('fs');

// Read the extracted text
const text = fs.readFileSync('extracted-text.txt', 'utf-8');

// Import the data extractor (we'll simulate it here)
function extractExperience(text) {
  const experiences = [];

  const dateRangePattern =
    /(?:(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*)?(\d{4}))\s*[-–—to]+\s*(?:((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*)?(\d{4})|Present|Current)/gi;

  const lines = text.split("\n");

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
            candidateLine.length < 100 &&
            !candidateLine.match(/^[A-Z\s&]{4,}$/) &&
            !candidateLine.match(/^[\d\s\-•\*]+$/) &&
            !candidateLine.toLowerCase().includes('page ') &&
            !candidateLine.match(/^-+\s*\d+/)) {

          if (candidateLine.match(/^[A-Z][a-z]/) ||
              candidateLine.match(/(Manager|Director|Engineer|Developer|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior|Consultant|Officer|Administrator|Executive|Supervisor|Head|Chief|Technician|Translator|Crew)/i)) {
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
            candidateLine.length < 100 &&
            !candidateLine.match(/^[A-Z\s&]{4,}$/) &&
            !candidateLine.match(/^[\d\s\-•\*]+$/) &&
            !candidateLine.toLowerCase().includes('page ')) {

          if (candidateLine.match(/(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.|Group|Technologies|Solutions|Services|Hospital|Medical|University|College|Institute|Agency|Organization|Foundation|Association|Department|Center|Foods)/i) ||
              candidateLine.match(/^[A-Z][\w\s&,'.-]{2,}(?:[A-Z]|Inc|LLC|Ltd)/) ||
              (candidateLine.match(/^[A-Z]/) && !candidateLine.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)/i))) {
            entry.employer = candidateLine;
            break;
          }
        }
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
