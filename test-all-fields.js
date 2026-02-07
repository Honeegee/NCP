const fs = require('fs');

// Read the extracted text
const text = fs.readFileSync('extracted-text.txt', 'utf-8');

// Simulate the full extractEducation function with all new fields
function extractEducation(text) {
  const education = [];

  let searchText = text;
  const educationHeaderMatch = text.match(/\n(EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND|ACADEMIC QUALIFICATIONS)[\s:]*\n/i);

  if (educationHeaderMatch && educationHeaderMatch.index !== undefined) {
    const sectionStart = educationHeaderMatch.index + educationHeaderMatch[0].length;
    const afterEducation = text.substring(sectionStart);

    const lines = afterEducation.split('\n');
    let sectionEnd = afterEducation.length;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const letters = line.replace(/[^a-zA-Z]/g, '');
      const upperCount = (line.match(/[A-Z]/g) || []).length;
      const upperCaseRatio = letters.length > 0 ? upperCount / letters.length : 0;

      if (line.length >= 10 &&
          upperCaseRatio > 0.7 &&
          line.match(/^[A-Z]/) &&
          !line.match(/^\d/)) {
        sectionEnd = lines.slice(0, i).join('\n').length;
        break;
      }
    }

    searchText = afterEducation.substring(0, sectionEnd);
  }

  const lines = searchText.split("\n").map(l => l.trim()).filter(Boolean);

  const degreePatterns = [
    /Bachelor\s+of\s+Science\s+in\s+[\w\s]+/i,
    /(?:Chemical|Mechanical|Electrical|Civil)\s+Engineering\s+Technology/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let degreeFound = false;
    let degreeText = "";

    for (const pattern of degreePatterns) {
      const match = line.match(pattern);
      if (match) {
        degreeText = match[0].trim();
        degreeFound = true;
        break;
      }
    }

    if (degreeFound && degreeText) {
      const entry = { degree: degreeText };

      // Field of study
      for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
        const candidateLine = lines[j];
        if (candidateLine.match(/^(?:Focus on|Major in|Specialization)[:\s]*/i)) {
          entry.field_of_study = candidateLine
            .replace(/^(?:Focus on|Major in|Specialization)[:\s]*/i, '')
            .trim();
          break;
        }
      }

      // Status
      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const candidateLine = lines[j];
        if (candidateLine.match(/^(?:1st|2nd|3rd|4th|5th)\s+Year\s+Student/i)) {
          entry.status = candidateLine.trim();
          break;
        }
      }

      // Institution
      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const candidateLine = lines[j];

        if (candidateLine.match(/^(?:Focus on|Major in|4th Year|3rd Year)/i)) continue;

        if (candidateLine.match(/(?:University|College|Institute|Polytechnic)/i) &&
            candidateLine.length < 150 &&
            !candidateLine.match(/^[A-Z\s&]{4,}$/)) {
          entry.institution = candidateLine
            .replace(/,?\s*\d{4}\s*(?:-\s*\d{4})?/g, '')
            .replace(/,\s*(?:Philippines|Negros|Occidental).*$/i, '')
            .trim();
          break;
        }
      }

      // Date range
      const yearContext = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).join(" ");
      const dateRangeMatch = yearContext.match(/(\d{4})\s*[-–—]\s*(?:(\d{4})|Present|Current)/i);
      if (dateRangeMatch) {
        const startYear = parseInt(dateRangeMatch[1]);
        const endYear = dateRangeMatch[2] ? parseInt(dateRangeMatch[2]) : null;

        entry.start_date = `${startYear}-01-01`;
        if (!endYear || /present|current/i.test(yearContext)) {
          entry.end_date = 'Present';
        } else {
          entry.end_date = `${endYear}-12-31`;
          entry.year = endYear;
        }
      }

      // Institution location
      const contextLines = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 5));
      for (const contextLine of contextLines) {
        if (contextLine.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s+(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s+)?)+$/)) {
          if (contextLine.match(/(?:City|Negros|Occidental|Philippines)/i)) {
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

console.log('=== TESTING ALL EDUCATION FIELDS ===\n');

const education = extractEducation(text);

education.forEach((edu, idx) => {
  console.log(`\n📚 Education Entry #${idx + 1}:`);
  console.log(`   Degree: ${edu.degree}`);
  console.log(`   Field of Study: ${edu.field_of_study || '(none)'}`);
  console.log(`   Status: ${edu.status || '(none)'}`);
  console.log(`   Institution: ${edu.institution || '(not found)'}`);
  console.log(`   Location: ${edu.institution_location || '(none)'}`);
  console.log(`   Date Range: ${edu.start_date || '(none)'} - ${edu.end_date || '(none)'}`);
  console.log(`   Graduation Year: ${edu.year || '(none)'}`);
});

console.log('\n\n=== SUMMARY ===');
console.log(`Total entries: ${education.length}`);
console.log(`With field_of_study: ${education.filter(e => e.field_of_study).length}`);
console.log(`With status: ${education.filter(e => e.status).length}`);
console.log(`With location: ${education.filter(e => e.institution_location).length}`);
console.log(`With date range: ${education.filter(e => e.start_date).length}`);
