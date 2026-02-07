const fs = require('fs');
const text = fs.readFileSync('extracted-text.txt', 'utf-8');

function extractEducation(text) {
  const education = [];

  // Manual section extraction
  let searchText = text;
  const educationHeaderMatch = text.match(/\n(EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND|ACADEMIC QUALIFICATIONS)[\s:]*\n/i);

  console.log('=== MANUAL SECTION EXTRACTION ===');
  if (educationHeaderMatch && educationHeaderMatch.index !== undefined) {
    const sectionStart = educationHeaderMatch.index + educationHeaderMatch[0].length;
    const afterEducation = text.substring(sectionStart);

    const lines = afterEducation.split('\n');
    let sectionEnd = afterEducation.length;

    console.log('Lines in afterEducation:');
    lines.forEach((line, i) => console.log(`${i}: "${line.trim()}"`));

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length >= 10 && line.match(/^[A-Z][A-Z\s&()]+$/) && !line.match(/^\d/)) {
        console.log(`\nFound next section at line ${i}: "${line}"`);
        sectionEnd = lines.slice(0, i).join('\n').length;
        break;
      }
    }

    searchText = afterEducation.substring(0, sectionEnd);
    console.log('\n=== EXTRACTED SEARCH TEXT ===');
    console.log(searchText);
  }

  // Split into lines
  const lines = searchText.split("\n").map(l => l.trim()).filter(Boolean);
  console.log('\n=== PARSED LINES ===');
  lines.forEach((line, i) => console.log(`${i}: "${line}"`));

  // Degree patterns
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

  console.log('\n=== MATCHING DEGREES ===');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let degreeFound = false;
    let degreeText = "";

    for (let p = 0; p < degreePatterns.length; p++) {
      const match = line.match(degreePatterns[p]);
      if (match) {
        degreeText = match[0].trim();
        degreeFound = true;
        console.log(`\nLine ${i}: "${line}"`);
        console.log(`  ✓ Matched pattern ${p}: "${degreeText}"`);
        break;
      }
    }

    if (degreeFound && degreeText) {
      const entry = { degree: degreeText };

      // Look for institution
      console.log(`  Looking for institution in lines ${Math.max(0, i - 2)} to ${Math.min(lines.length, i + 3)}:`);
      for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 3); j++) {
        const candidateLine = lines[j];
        if (candidateLine === line) {
          console.log(`    Line ${j}: "${candidateLine}" (skipped - degree line)`);
          continue;
        }

        console.log(`    Line ${j}: "${candidateLine}"`);

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
          console.log(`      → Found institution: "${entry.institution}"`);
          break;
        }
      }

      // Fallback
      if (!entry.institution) {
        console.log(`  No institution found with keywords, trying fallback...`);
        for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 3); j++) {
          const candidateLine = lines[j];
          if (candidateLine === line) continue;

          if (candidateLine.match(/^[A-Z][a-z][\w\s,.-]+$/) &&
              candidateLine.length > 5 &&
              candidateLine.length < 150 &&
              !candidateLine.match(/^(?:January|February|March|April|May|June|July|August|September|October|November|December)/i) &&
              !candidateLine.match(/^\d+/)) {
            entry.institution = candidateLine.replace(/,?\s*\d{4}\s*(?:-\s*\d{4})?/g, '').trim();
            console.log(`    Line ${j}: "${candidateLine}" → MATCHED (fallback)`);
            console.log(`      → Institution: "${entry.institution}"`);
            break;
          } else {
            console.log(`    Line ${j}: "${candidateLine}" → no match`);
          }
        }
      }

      // Look for year
      const yearContext = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(" ");
      const yearMatch = yearContext.match(/(?:Graduated|Graduation|Class of)?\s*\.?\s*(\d{4})|(\d{4})\s*(?:-\s*(?:\d{4}|Present|Current))?/i);
      if (yearMatch) {
        const year = parseInt(yearMatch[1] || yearMatch[2]);
        if (year >= 1950 && year <= 2032) {
          entry.year = year;
          console.log(`  → Year: ${year}`);
        }
      }

      education.push(entry);
      console.log(`  → Final entry:`, entry);
    }
  }

  return education;
}

const education = extractEducation(text);

console.log('\n=== FINAL RESULTS ===');
console.log(JSON.stringify(education, null, 2));
console.log(`\nTotal: ${education.length} education entries`);
