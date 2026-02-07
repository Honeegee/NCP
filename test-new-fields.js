const fs = require('fs');

// Read the extracted text
const text = fs.readFileSync('extracted-text.txt', 'utf-8');

// Simulate the extractEducation function
function extractEducation(text) {
  const education = [];

  // First try to find the EDUCATION section manually
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
    /Bachelor\s+of\s+Arts\s+in\s+[\w\s]+/i,
    /Master\s+of\s+Science\s+in\s+[\w\s]+/i,
    /Master\s+of\s+Arts\s+in\s+[\w\s]+/i,
    /(?:BSN|B\.?S\.?N\.?|Bachelor\s+of\s+Science\s+in\s+Nursing)/i,
    /(?:Chemical|Mechanical|Electrical|Civil)\s+Engineering\s+Technology/i,
    /(?:B\.?S\.?|B\.?A\.?|Bachelor(?:'s)?)\s+(?:of\s+)?(?:Science|Arts)?\s*(?:in\s+)?([A-Z][\w\s&,]+)/i,
    /(?:M\.?S\.?|M\.?A\.?|MBA|Master(?:'s)?)\s+(?:of\s+)?(?:Science|Arts|Business Administration)?\s*(?:in\s+)?([A-Z][\w\s&,]+)/i,
    /(?:Ph\.?D\.?|Doctorate|Doctor)\s+(?:of\s+)?(?:Philosophy)?\s*(?:in\s+)?([A-Z][\w\s&,]+)?/i,
    /(?:A\.?S\.?|A\.?A\.?|Associate(?:'s)?)\s+(?:of\s+)?(?:Science|Arts)?\s*(?:in\s+)?([A-Z][\w\s&,]+)/i,
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

      // Look for major/specialization
      for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
        const candidateLine = lines[j];

        if (candidateLine.match(/^(?:Focus on|Major in|Specialization|Concentration|Emphasis|Specializing in)[:\s]*/i)) {
          entry.field_of_study = candidateLine
            .replace(/^(?:Focus on|Major in|Specialization|Concentration|Emphasis|Specializing in)[:\s]*/i, '')
            .trim();
          console.log(`  ✓ Found major/specialization: "${entry.field_of_study}"`);
          break;
        }
      }

      // Look for institution (forward first)
      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const candidateLine = lines[j];

        if (candidateLine.match(/(?:Focus on|Major in|Specialization|4th Year|3rd Year|2nd Year|1st Year)/i)) continue;

        if (candidateLine.match(/(?:University|College|Institute|School|Academy|Polytechnic)/i) &&
            candidateLine.length < 150 &&
            !candidateLine.match(/^[A-Z\s&]{4,}$/)) {
          entry.institution = candidateLine
            .replace(/,?\s*\d{4}\s*(?:-\s*\d{4})?/g, '')
            .replace(/,\s*(?:Manila|Quezon|Cebu|Davao|Philippines|USA|UK|Canada|Australia|Singapore).*$/i, '')
            .trim();
          break;
        }
      }

      education.push(entry);
    }
  }

  return education;
}

// Simulate the extractAddress function
function extractAddress(text) {
  const topSection = text.substring(0, 1500);
  const lines = topSection.split('\n').map(l => l.trim()).filter(Boolean);

  const skipPatterns = [
    /^\+?\d+[\s\-\(\)]+\d+/,
    /^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/,
    /^https?:\/\//i,
    /^(?:PROFESSIONAL\s+SUMMARY|SUMMARY|OBJECTIVE|EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS)/i,
  ];

  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];

    if (skipPatterns.some(pattern => pattern.test(line))) continue;
    if (line.length < 10 || line.length > 150) continue;

    if (line.match(/,/) &&
        line.split(',').length >= 2 &&
        line.split(',').length <= 4 &&
        !line.match(/^[A-Z\s&]+$/) &&
        line.match(/(?:City|Quezon|Manila|Cebu|Davao|Makati|Taguig|Pasig|Philippines|Negros|Occidental)/i)) {
      return line;
    }
  }

  return undefined;
}

console.log('=== TESTING NEW EXTRACTION FEATURES ===\n');

console.log('1. EDUCATION WITH FIELD OF STUDY:');
const education = extractEducation(text);
education.forEach((edu, idx) => {
  console.log(`\nEducation Entry #${idx + 1}:`);
  console.log(`  Degree: ${edu.degree}`);
  console.log(`  Field of Study: ${edu.field_of_study || '(none)'}`);
  console.log(`  Institution: ${edu.institution || '(not found)'}`);
});

console.log('\n\n2. ADDRESS EXTRACTION:');
const address = extractAddress(text);
console.log(`  Address: ${address || '(not found)'}`);

console.log('\n\n=== SUMMARY ===');
console.log(`✓ Education entries found: ${education.length}`);
console.log(`✓ Entries with field_of_study: ${education.filter(e => e.field_of_study).length}`);
console.log(`✓ Address extracted: ${address ? 'Yes' : 'No'}`);
