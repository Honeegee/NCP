const fs = require('fs');
const path = require('path');

async function testParse() {
  // Read the PDF file
  const pdfPath = path.join(__dirname, 'honeydenolan2025.pdf');
  const buffer = fs.readFileSync(pdfPath);

  // Extract text using pdf-parse
  const { PDFParse } = require('pdf-parse');
  const parser = new PDFParse({ verbosity: 0, data: buffer });
  await parser.load();
  const result = await parser.getText();

  const text = result.text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  console.log('=== EXTRACTED TEXT ===');
  console.log(text);
  console.log('\n=== TEXT LENGTH ===');
  console.log(text.length);

  // Save to file for inspection
  fs.writeFileSync('extracted-text.txt', text);
  console.log('\n✓ Saved to extracted-text.txt');
}

testParse().catch(console.error);
