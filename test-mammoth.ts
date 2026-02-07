/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test: Verify mammoth.js v1.11.0 works for .docx parsing via require().
 *
 * 1. Create a minimal .docx file in memory (a .docx is a ZIP archive with XML).
 * 2. Parse it with mammoth.extractRawText({ buffer }).
 * 3. Confirm output matches expected text.
 * 4. Confirm mammoth rejects a .doc (old binary format) buffer.
 */

const JSZip = require("jszip");
const mammoth = require("mammoth");

// -- Helpers --

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Build a minimal valid .docx buffer using JSZip. */
async function buildDocx(paragraphs: string[]): Promise<Buffer> {
  const zip = new JSZip();

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>`
  );

  const pXml = paragraphs
    .map((t) => `<w:p><w:r><w:t>${escapeXml(t)}</w:t></w:r></w:p>`)
    .join("\n    ");

  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${pXml}
  </w:body>
</w:document>`
  );

  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`
  );

  const arrayBuf: ArrayBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return Buffer.from(arrayBuf);
}

// -- Tests --

async function main() {
  let passed = 0;
  let failed = 0;

  // Test 1: extractRawText with a valid single-paragraph .docx buffer
  console.log("\n=== Test 1: Parse valid .docx buffer (single paragraph) ===");
  try {
    const testText = "Jane Doe — Registered Nurse, BSN, 5 years experience.";
    const docxBuf = await buildDocx([testText]);
    console.log("  Created .docx buffer:", docxBuf.length, "bytes");

    const result = await mammoth.extractRawText({ buffer: docxBuf });
    console.log("  Extracted text:", JSON.stringify(result.value));
    console.log("  Messages:", result.messages);

    if (result.value.trim() === testText) {
      console.log("  PASS: Extracted text matches input.");
      passed++;
    } else {
      console.log("  FAIL: Expected", JSON.stringify(testText), "got", JSON.stringify(result.value.trim()));
      failed++;
    }
  } catch (err) {
    console.error("  FAIL (exception):", err);
    failed++;
  }

  // Test 2: Multi-paragraph .docx
  console.log("\n=== Test 2: Multi-paragraph .docx ===");
  try {
    const buf = await buildDocx(["Paragraph One", "Paragraph Two"]);
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
    console.log("  Extracted:", JSON.stringify(result.value));

    if (result.value.includes("Paragraph One") && result.value.includes("Paragraph Two")) {
      console.log("  PASS: Both paragraphs extracted.");
      passed++;
    } else {
      console.log("  FAIL: Missing paragraph content.");
      failed++;
    }
  } catch (err) {
    console.error("  FAIL (exception):", err);
    failed++;
  }

  // Test 3: mammoth rejects non-docx (fake .doc OLE2 binary)
  console.log("\n=== Test 3: Reject .doc (old binary format) ===");
  try {
    // Real .doc files start with the OLE2 compound document magic bytes
    const docMagic = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    const fakeDoc = Buffer.concat([docMagic, Buffer.alloc(512)]);

    await mammoth.extractRawText({ buffer: fakeDoc });
    console.log("  FAIL: mammoth did not throw on .doc buffer.");
    failed++;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log("  mammoth threw:", JSON.stringify(msg));
    console.log("  PASS: mammoth correctly rejects non-docx binary data.");
    passed++;
  }

  // Test 4: Confirm require() import style works
  console.log("\n=== Test 4: require() import works ===");
  console.log("  mammoth type:", typeof mammoth);
  console.log("  extractRawText type:", typeof mammoth.extractRawText);
  if (typeof mammoth.extractRawText === "function") {
    console.log("  PASS: require('mammoth') works and exposes extractRawText.");
    passed++;
  } else {
    console.log("  FAIL: extractRawText not a function.");
    failed++;
  }

  // Summary
  console.log("\n========================================");
  console.log("Results:", passed, "passed,", failed, "failed out of", passed + failed, "tests");
  console.log("========================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

main();
