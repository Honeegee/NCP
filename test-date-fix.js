const fs = require('fs');

// Read the extracted text
const text = fs.readFileSync('extracted-text.txt', 'utf-8');

function extractEducation(text) {
  const education = [];

  let searchText = text;
  const educationHeaderMatch = text.match(/\n(EDUCATION|ACADEMIC BACKGROUND)[\s:]*\n/i);

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

      if (line.length >= 10 && upperCaseRatio > 0.7 && line.match(/^[A-Z]/) && !line.match(/^\d/)) {
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

      console.log(`\nFound degree at line ${i}: "${degreeText}"`);
      console.log(`  Searching for date in lines ${i+1} to ${Math.min(lines.length, i+4)}:`);

      // Look for date range line by line
      let dateFound = false;
      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const candidateLine = lines[j];

        console.log(`    Line ${j}: "${candidateLine}"`);

        // Skip if this line looks like the start of another degree
        let isAnotherDegree = false;
        for (const pattern of degreePatterns) {
          if (candidateLine.match(pattern)) {
            isAnotherDegree = true;
            console.log(`      → Detected another degree, stopping search`);
            break;
          }
        }
        if (isAnotherDegree) break;

        // Try to match date range
        const dateRangeMatch = candidateLine.match(/(\d{4})\s*[-–—]\s*(?:(\d{4})|Present|Current)/i);
        if (dateRangeMatch) {
          const startYear = parseInt(dateRangeMatch[1]);
          const endYear = dateRangeMatch[2] ? parseInt(dateRangeMatch[2]) : null;

          console.log(`      → Found date range: ${startYear} - ${endYear || 'Present'}`);

          if (startYear >= 1950 && startYear <= new Date().getFullYear() + 6) {
            entry.start_date = `${startYear}-01-01`;

            if (!endYear || /present|current/i.test(candidateLine)) {
              entry.end_date = 'Present';
            } else {
              entry.end_date = `${endYear}-12-31`;
              entry.year = endYear;
            }
            dateFound = true;
            break;
          }
        }
      }

      if (!dateFound) {
        console.log(`  ⚠ No date found for this entry`);
      }

      education.push(entry);
    }
  }

  return education;
}

console.log('=== TESTING DATE EXTRACTION FIX ===\n');

const education = extractEducation(text);

console.log('\n\n=== RESULTS ===\n');
education.forEach((edu, idx) => {
  console.log(`Entry #${idx + 1}:`);
  console.log(`  Degree: ${edu.degree}`);
  console.log(`  Date Range: ${edu.start_date || '(none)'} to ${edu.end_date || '(none)'}`);
  console.log(`  Graduation Year: ${edu.year || '(none)'}`);
});
