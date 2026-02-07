const fs = require('fs');

// Read the extracted text
const text = fs.readFileSync('extracted-text.txt', 'utf-8');

function extractEducation(text) {
  const education = [];

  // First try to find the EDUCATION section
  const eduSectionMatch = text.match(
    /(?:EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND|ACADEMIC QUALIFICATIONS)[\s:]*\n([\s\S]*?)(?:\n(?:[A-Z][A-Z\s&()]{9,})\n|$)/i
  );

  console.log('=== EDUCATION SECTION MATCH ===');
  if (eduSectionMatch) {
    console.log('Found education section!');
    console.log('Section content:');
    console.log(eduSectionMatch[1].substring(0, 500));
  } else {
    console.log('No education section found!');
    return education;
  }

  const searchText = eduSectionMatch[1];
  const lines = searchText.split("\n").map(l => l.trim()).filter(Boolean);

  console.log('\n=== EDUCATION LINES ===');
  lines.forEach((line, i) => console.log(`${i}: ${line}`));

  // Common degree patterns
  const degreePatterns = [
    /(?:BSN|B\.?S\.?N\.?|Bachelor\s+of\s+Science\s+in\s+Nursing)/i,
    /(?:B\.?S\.?|B\.?A\.?|Bachelor(?:'s)?)\s+(?:of\s+)?(?:Science|Arts)?\s*(?:in\s+)?([A-Z][\w\s&,]+?)(?:\s+(?:Degree|Program|Technology))?/i,
    /Bachelor\s+of\s+Science\s+in\s+[\w\s]+/i,
    /(?:M\.?S\.?|M\.?A\.?|MBA|Master(?:'s)?)\s+(?:of\s+)?(?:Science|Arts|Business Administration)?\s*(?:in\s+)?([A-Z][\w\s&,]+?)(?:\s+(?:Degree|Program))?/i,
    /(?:Ph\.?D\.?|Doctorate|Doctor)\s+(?:of\s+)?(?:Philosophy)?\s*(?:in\s+)?([A-Z][\w\s&,]+?)?/i,
    /(?:A\.?S\.?|A\.?A\.?|Associate(?:'s)?)\s+(?:of\s+)?(?:Science|Arts)?\s*(?:in\s+)?([A-Z][\w\s&,]+?)(?:\s+(?:Degree|Program))?/i,
    /(?:Chemical|Mechanical|Electrical|Civil)\s+Engineering\s+Technology/i,
  ];

  console.log('\n=== CHECKING EACH LINE FOR DEGREE PATTERNS ===');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log(`\nLine ${i}: "${line}"`);

    let degreeFound = false;
    let degreeText = "";

    for (let p = 0; p < degreePatterns.length; p++) {
      const pattern = degreePatterns[p];
      const match = line.match(pattern);
      if (match) {
        console.log(`  ✓ Matched pattern ${p}: "${match[0]}"`);
        degreeText = match[0].trim();
        degreeFound = true;
        break;
      }
    }

    if (!degreeFound) {
      console.log('  ✗ No pattern matched');
    }

    if (degreeFound && degreeText) {
      const entry = { degree: degreeText };
      console.log(`  → Creating entry: ${degreeText}`);

      // Look for institution
      for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 3); j++) {
        const candidateLine = lines[j];
        if (candidateLine === line) continue;

        if (candidateLine.match(/(?:University|College|Institute|School|Academy|Polytechnic)/i) &&
            candidateLine.length < 150 &&
            !candidateLine.match(/^[A-Z\s&]{4,}$/)) {
          entry.institution = candidateLine
            .replace(/,?\s*\d{4}\s*(?:-\s*\d{4})?/g, '')
            .replace(/,\s*(?:Manila|Quezon|Cebu|Davao|Philippines|USA|UK|Canada|Australia|Singapore).*$/i, '')
            .replace(/,\s*(?:CA|NY|TX|FL)\s*$/i, '')
            .trim()
            .replace(/^,\s*/, '')
            .replace(/,\s*$/, '');
          console.log(`  → Found institution: ${entry.institution}`);
          break;
        }
      }

      // Look for year
      const yearContext = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(" ");
      const yearMatch = yearContext.match(/(?:Graduated|Graduation|Class of)?\s*\.?\s*(\d{4})|(\d{4})\s*(?:-\s*(?:\d{4}|Present|Current))?/i);
      if (yearMatch) {
        const year = parseInt(yearMatch[1] || yearMatch[2]);
        if (year >= 1950 && year <= new Date().getFullYear() + 6) {
          entry.year = year;
          console.log(`  → Found year: ${year}`);
        }
      }

      education.push(entry);
    }
  }

  return education;
}

const education = extractEducation(text);

console.log('\n=== FINAL EDUCATION RESULTS ===');
console.log(JSON.stringify(education, null, 2));
console.log(`\nTotal: ${education.length} education entries found`);
