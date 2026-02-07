const fs = require('fs');
const text = fs.readFileSync('extracted-text.txt', 'utf-8');

console.log('=== TESTING REGEX PATTERNS ===\n');

// Find EDUCATION
const educationIndex = text.indexOf('EDUCATION');
console.log(`EDUCATION found at index: ${educationIndex}`);

// Get 500 chars after EDUCATION
const afterEducation = text.substring(educationIndex, educationIndex + 500);
console.log('\n=== TEXT AFTER EDUCATION (first 500 chars) ===');
console.log(afterEducation);
console.log('\n=== CHARACTER CODES ===');
// Show first 100 characters with their codes
for (let i = 0; i < Math.min(100, afterEducation.length); i++) {
  const char = afterEducation[i];
  const code = char.charCodeAt(0);
  if (char === '\n') {
    console.log(`[${i}] \\n (code: ${code})`);
  } else if (char === '\r') {
    console.log(`[${i}] \\r (code: ${code})`);
  } else {
    console.log(`[${i}] "${char}" (code: ${code})`);
  }
}

console.log('\n=== TESTING ORIGINAL PATTERN ===');
const pattern1 = /(?:EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND|ACADEMIC QUALIFICATIONS)[\s:]*\n([\s\S]*?)(?:\n[A-Z][A-Z\s&]{3,}\n|$)/i;
const match1 = text.match(pattern1);
if (match1) {
  console.log('Match found!');
  console.log('Captured group length:', match1[1].length);
  console.log('Captured group:', match1[1]);
} else {
  console.log('No match');
}

console.log('\n=== TESTING NEW PATTERN ===');
const pattern2 = /(?:EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND|ACADEMIC QUALIFICATIONS)[\s:]*\n([\s\S]*?)(?:\n(?:[A-Z][A-Z\s&()]{9,})\n|$)/i;
const match2 = text.match(pattern2);
if (match2) {
  console.log('Match found!');
  console.log('Captured group length:', match2[1].length);
  console.log('Captured group:', match2[1]);
} else {
  console.log('No match');
}

console.log('\n=== TRYING GREEDY VERSION ===');
const pattern3 = /(?:EDUCATION)[\s:]*\n([\s\S]+?)(?:\n[A-Z][A-Z\s&()]{10,}\n)/i;
const match3 = text.match(pattern3);
if (match3) {
  console.log('Match found!');
  console.log('Captured group length:', match3[1].length);
  console.log('First 300 chars:', match3[1].substring(0, 300));
} else {
  console.log('No match');
}
