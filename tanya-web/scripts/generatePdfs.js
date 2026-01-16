import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF from HTML content
 */
async function generatePdfFromHtml(html, outputPath, options = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set content
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // Generate PDF
  await page.pdf({
    path: outputPath,
    format: options.format || 'A4',
    margin: {
      top: options.margin || '20mm',
      right: options.margin || '20mm',
      bottom: options.margin || '20mm',
      left: options.margin || '20mm',
    },
    printBackground: true,
    ...options
  });
  
  await browser.close();
  console.log(`✓ Generated: ${outputPath}`);
}

/**
 * Create HTML template for a Tanya chapter
 */
function createChapterHtml(chapterNumber, content = '') {
  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      direction: rtl;
      line-height: 1.8;
      color: #333;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 60px;
      padding-bottom: 30px;
      border-bottom: 3px solid #027EC5;
    }
    
    .title {
      font-size: 48px;
      font-weight: bold;
      color: #027EC5;
      margin-bottom: 20px;
    }
    
    .chapter-number {
      font-size: 36px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .content {
      font-size: 18px;
      line-height: 2;
      text-align: justify;
      margin-bottom: 40px;
    }
    
    .footer {
      margin-top: 80px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">ספר התניא</div>
    <div class="chapter-number">פרק ${chapterNumber}</div>
  </div>
  
  <div class="content">
    ${content || `
      <p>זה תוכן לדוגמה לפרק ${chapterNumber}.</p>
      <p>כאן יופיע הטקסט המלא של הפרק.</p>
      <p>הטקסט יכול להכיל מספר פסקאות ויוצג בעברית עם יישור מימין לשמאל.</p>
    `}
  </div>
  
  <div class="footer">
    <p>ספר התניא - פרק ${chapterNumber}</p>
    <p>נוצר ב-${new Date().toLocaleDateString('he-IL')}</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Main function to generate multiple PDFs
 */
async function main() {
  const outputDir = path.join(__dirname, '../pdf-output');
  
  // Create output directory if it doesn't exist
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 Output directory: ${outputDir}`);
  } catch (error) {
    console.error('Error creating output directory:', error);
    process.exit(1);
  }
  
  // Configuration: adjust these values
  const startChapter = 1;
  const endChapter = 3; // Generate 3 PDFs as test
  
  console.log(`\n🚀 Starting PDF generation...`);
  console.log(`   Chapters: ${startChapter} to ${endChapter}\n`);
  
  // Generate PDFs
  for (let i = startChapter; i <= endChapter; i++) {
    const html = createChapterHtml(i);
    const outputPath = path.join(outputDir, `${i}.pdf`);
    
    try {
      await generatePdfFromHtml(html, outputPath, {
        format: 'A4',
        margin: '15mm'
      });
    } catch (error) {
      console.error(`✗ Error generating chapter ${i}:`, error.message);
    }
  }
  
  console.log(`\n✅ Done! Generated ${endChapter - startChapter + 1} PDFs in ${outputDir}\n`);
}

// Run the script
main().catch(console.error);
