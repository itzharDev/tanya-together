import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories
const MISHNAYOT_DIR = path.join(__dirname, '../mishnayot_texts');
const OUTPUT_DIR_CHAPTERS = path.join(__dirname, '../mishnah_pdfs_chapters');
const OUTPUT_DIR_SINGLE = path.join(__dirname, '../mishnah_pdfs_single');

// Hebrew tractate names mapping
const TRACTATE_HEBREW = {
  "Mishnah_Berakhot": "ברכות",
  "Mishnah_Peah": "פאה",
  "Mishnah_Demai": "דמאי",
  "Mishnah_Kilayim": "כלאים",
  "Mishnah_Sheviit": "שביעית",
  "Mishnah_Terumot": "תרומות",
  "Mishnah_Maasrot": "מעשרות",
  "Mishnah_Maaser_Sheni": "מעשר שני",
  "Mishnah_Challah": "חלה",
  "Mishnah_Orlah": "ערלה",
  "Mishnah_Bikkurim": "ביכורים",
  "Mishnah_Shabbat": "שבת",
  "Mishnah_Eruvin": "עירובין",
  "Mishnah_Pesachim": "פסחים",
  "Mishnah_Shekalim": "שקלים",
  "Mishnah_Yoma": "יומא",
  "Mishnah_Sukkah": "סוכה",
  "Mishnah_Beitzah": "ביצה",
  "Mishnah_Rosh_Hashanah": "ראש השנה",
  "Mishnah_Taanit": "תענית",
  "Mishnah_Megillah": "מגילה",
  "Mishnah_Moed_Katan": "מועד קטן",
  "Mishnah_Chagigah": "חגיגה",
  "Mishnah_Yevamot": "יבמות",
  "Mishnah_Ketubot": "כתובות",
  "Mishnah_Nedarim": "נדרים",
  "Mishnah_Nazir": "נזיר",
  "Mishnah_Sotah": "סוטה",
  "Mishnah_Gittin": "גיטין",
  "Mishnah_Kiddushin": "קידושין",
  "Mishnah_Bava_Kamma": "בבא קמא",
  "Mishnah_Bava_Metzia": "בבא מציעא",
  "Mishnah_Bava_Batra": "בבא בתרא",
  "Mishnah_Sanhedrin": "סנהדרין",
  "Mishnah_Makkot": "מכות",
  "Mishnah_Shevuot": "שבועות",
  "Mishnah_Eduyot": "עדיות",
  "Mishnah_Avodah_Zarah": "עבודה זרה",
  "Mishnah_Avot": "אבות",
  "Mishnah_Horayot": "הוריות",
  "Mishnah_Zevachim": "זבחים",
  "Mishnah_Menachot": "מנחות",
  "Mishnah_Chullin": "חולין",
  "Mishnah_Bekhorot": "בכורות",
  "Mishnah_Arakhin": "ערכין",
  "Mishnah_Temurah": "תמורה",
  "Mishnah_Keritot": "כריתות",
  "Mishnah_Meilah": "מעילה",
  "Mishnah_Tamid": "תמיד",
  "Mishnah_Middot": "מידות",
  "Mishnah_Kinnim": "קינים",
  "Mishnah_Kelim": "כלים",
  "Mishnah_Oholot": "אהלות",
  "Mishnah_Negaim": "נגעים",
  "Mishnah_Parah": "פרה",
  "Mishnah_Tahorot": "טהרות",
  "Mishnah_Mikvaot": "מקואות",
  "Mishnah_Niddah": "נדה",
  "Mishnah_Makhshirin": "מכשירין",
  "Mishnah_Zavim": "זבים",
  "Mishnah_Tevul_Yom": "טבול יום",
  "Mishnah_Yadayim": "ידיים",
  "Mishnah_Oktzin": "עוקצין"
};

// Traditional Mishnah order (6 Sedarim)
const MISHNAH_ORDER = [
  // סדר זרעים
  "Mishnah_Berakhot", "Mishnah_Peah", "Mishnah_Demai", "Mishnah_Kilayim",
  "Mishnah_Sheviit", "Mishnah_Terumot", "Mishnah_Maasrot", "Mishnah_Maaser_Sheni",
  "Mishnah_Challah", "Mishnah_Orlah", "Mishnah_Bikkurim",
  // סדר מועד
  "Mishnah_Shabbat", "Mishnah_Eruvin", "Mishnah_Pesachim", "Mishnah_Shekalim",
  "Mishnah_Yoma", "Mishnah_Sukkah", "Mishnah_Beitzah", "Mishnah_Rosh_Hashanah",
  "Mishnah_Taanit", "Mishnah_Megillah", "Mishnah_Moed_Katan", "Mishnah_Chagigah",
  // סדר נשים
  "Mishnah_Yevamot", "Mishnah_Ketubot", "Mishnah_Nedarim", "Mishnah_Nazir",
  "Mishnah_Sotah", "Mishnah_Gittin", "Mishnah_Kiddushin",
  // סדר נזיקין
  "Mishnah_Bava_Kamma", "Mishnah_Bava_Metzia", "Mishnah_Bava_Batra",
  "Mishnah_Sanhedrin", "Mishnah_Makkot", "Mishnah_Shevuot", "Mishnah_Eduyot",
  "Mishnah_Avodah_Zarah", "Mishnah_Avot", "Mishnah_Horayot",
  // סדר קודשים
  "Mishnah_Zevachim", "Mishnah_Menachot", "Mishnah_Chullin", "Mishnah_Bekhorot",
  "Mishnah_Arakhin", "Mishnah_Temurah", "Mishnah_Keritot", "Mishnah_Meilah",
  "Mishnah_Tamid", "Mishnah_Middot", "Mishnah_Kinnim",
  // סדר טהרות
  "Mishnah_Kelim", "Mishnah_Oholot", "Mishnah_Negaim", "Mishnah_Parah",
  "Mishnah_Tahorot", "Mishnah_Mikvaot", "Mishnah_Niddah", "Mishnah_Makhshirin",
  "Mishnah_Zavim", "Mishnah_Tevul_Yom", "Mishnah_Yadayim", "Mishnah_Oktzin"
];

function stripHtmlTags(text) {
  return text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function numberToHebrewGematria(num) {
  const hebrewLetters = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט',  // 1-9
    'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ',  // 10-90
    'ק', 'ר', 'ש', 'ת'  // 100-400
  ];

  if (num <= 0) return '';
  if (num <= 9) return hebrewLetters[num - 1];
  if (num === 10) return 'י';
  if (num < 20) return 'י' + hebrewLetters[num - 11];
  if (num === 20) return 'כ';
  if (num < 30) return 'כ' + hebrewLetters[num - 21];
  return hebrewLetters[(num - 1) % 22];
}

function extractTextFromChapter(chapterData) {
  try {
    if (chapterData.versions) {
      for (const version of chapterData.versions) {
        if (version.language === 'he') {
          return version.text || [];
        }
      }
    }
    if (chapterData.he) {
      return chapterData.he;
    }
    return [];
  } catch (error) {
    console.error('Error extracting text:', error);
    return [];
  }
}

function createSingleMishnahHtml(tractateName, chapterNum, mishnahNum, mishnahText) {
  const tractateHe = TRACTATE_HEBREW[tractateName] || tractateName.replace('Mishnah_', '');
  const chapterHebrew = numberToHebrewGematria(chapterNum);
  const mishnahHebrew = numberToHebrewGematria(mishnahNum);
  const cleanText = stripHtmlTags(mishnahText);

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
    
    @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700&display=swap');
    
    body {
      font-family: 'Frank Ruhl Libre', 'David Libre', 'Times New Roman', serif;
      direction: rtl;
      line-height: 1.9;
      color: #282828;
      padding: 40px;
      background: #FFFAF5;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      border: 3px solid #04478E;
      padding: 40px;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid #04478E;
    }
    
    .tractate-title {
      font-size: 42px;
      font-weight: bold;
      color: #04478E;
      margin-bottom: 15px;
    }
    
    .chapter-title {
      font-size: 32px;
      color: #04478E;
      font-weight: bold;
    }
    
    .content {
      margin-bottom: 40px;
    }
    
    .mishnah-text {
      font-size: 26px;
      line-height: 2;
      text-align: justify;
      color: #282828;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 14px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="tractate-title">מסכת ${tractateHe}</div>
      <div class="chapter-title">פרק ${chapterHebrew} משנה ${mishnahHebrew}</div>
    </div>
    
    <div class="content">
      <div class="mishnah-text">${cleanText}</div>
    </div>
    
    <div class="footer">
      <p>מקור: ספריא | Powered by Sefaria.org</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function createChapterHtml(tractateName, chapterNum, mishnayotTexts) {
  const tractateHe = TRACTATE_HEBREW[tractateName] || tractateName.replace('Mishnah_', '');
  const chapterHebrew = numberToHebrewGematria(chapterNum);

  const mishnayotHtml = mishnayotTexts.map((text, idx) => {
    const cleanText = stripHtmlTags(text);
    const mishnahNum = numberToHebrewGematria(idx + 1);
    return `
      <div class="mishnah">
        <span class="mishnah-number">${mishnahNum}.</span>
        <span class="mishnah-text">${cleanText}</span>
      </div>
    `;
  }).join('');

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
    
    @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700&display=swap');
    
    body {
      font-family: 'Frank Ruhl Libre', 'David Libre', 'Times New Roman', serif;
      direction: rtl;
      line-height: 1.9;
      color: #282828;
      padding: 40px;
      background: #FFFAF5;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      border: 3px solid #04478E;
      padding: 40px;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid #04478E;
    }
    
    .tractate-title {
      font-size: 42px;
      font-weight: bold;
      color: #04478E;
      margin-bottom: 15px;
    }
    
    .chapter-title {
      font-size: 32px;
      color: #04478E;
      font-weight: bold;
    }
    
    .content {
      margin-bottom: 40px;
    }
    
    .mishnah {
      margin-bottom: 25px;
      font-size: 24px;
      line-height: 2;
      text-align: justify;
    }
    
    .mishnah-number {
      color: #04478E;
      font-weight: bold;
      margin-left: 8px;
    }
    
    .mishnah-text {
      color: #282828;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 14px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="tractate-title">מסכת ${tractateHe}</div>
      <div class="chapter-title">פרק ${chapterHebrew}</div>
    </div>
    
    <div class="content">
      ${mishnayotHtml}
    </div>
    
    <div class="footer">
      <p>מקור: ספריא | Powered by Sefaria.org</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function generatePdfFromHtml(html, outputPath) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: {
      top: '15mm',
      right: '15mm',
      bottom: '15mm',
      left: '15mm',
    },
    printBackground: true
  });

  await browser.close();
}

async function main() {
  try {
    // Create output directories
    await fs.mkdir(OUTPUT_DIR_CHAPTERS, { recursive: true });
    await fs.mkdir(OUTPUT_DIR_SINGLE, { recursive: true });
    
    console.log('🎨 Generating ALL Mishnah PDFs...');
    console.log('📊 2 versions:');
    console.log('   1. By chapters (525 PDFs)');
    console.log('   2. By individual mishnayot (~4,192 PDFs)\n');

    let chapterCounter = 0;
    let mishnahCounter = 0;

    // Process tractates in traditional order
    for (const tractateName of MISHNAH_ORDER) {
      const tractateDir = path.join(MISHNAYOT_DIR, tractateName);

      try {
        await fs.access(tractateDir);
      } catch {
        console.log(`⚠️  Skipping ${tractateName} - not found`);
        continue;
      }

      console.log(`\n📖 Processing ${tractateName}...`);

      // Get all chapter files
      const files = await fs.readdir(tractateDir);
      const chapterFiles = files
        .filter(f => f.startsWith('chapter_') && f.endsWith('.json'))
        .sort((a, b) => {
          const numA = parseInt(a.replace('chapter_', '').replace('.json', ''));
          const numB = parseInt(b.replace('chapter_', '').replace('.json', ''));
          return numA - numB;
        });

      // Process each chapter
      for (const chapterFile of chapterFiles) {
        const chapterNum = parseInt(chapterFile.replace('chapter_', '').replace('.json', ''));
        const chapterPath = path.join(tractateDir, chapterFile);

        const fileContent = await fs.readFile(chapterPath, 'utf-8');
        const chapterData = JSON.parse(fileContent);

        const mishnayotTexts = extractTextFromChapter(chapterData);

        if (!mishnayotTexts || mishnayotTexts.length === 0) {
          continue;
        }

        // 1. Create chapter PDF
        chapterCounter++;
        const chapterOutputPath = path.join(OUTPUT_DIR_CHAPTERS, `${chapterCounter}.pdf`);
        const chapterHtml = createChapterHtml(tractateName, chapterNum, mishnayotTexts);
        await generatePdfFromHtml(chapterHtml, chapterOutputPath);
        
        console.log(`  ✅ Chapter ${chapterCounter}: ${tractateName} פרק ${chapterNum}`);
        
        // 2. Create individual mishna PDFs
        for (let mishnahIdx = 0; mishnahIdx < mishnayotTexts.length; mishnahIdx++) {
          mishnahCounter++;
          const mishnahOutputPath = path.join(OUTPUT_DIR_SINGLE, `${mishnahCounter}.pdf`);
          const mishnahHtml = createSingleMishnahHtml(tractateName, chapterNum, mishnahIdx + 1, mishnayotTexts[mishnahIdx]);
          await generatePdfFromHtml(mishnahHtml, mishnahOutputPath);
        }
        
        console.log(`     + ${mishnayotTexts.length} individual mishnayot`);
      }
    }

    console.log(`\n\n🎉 Done!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Chapters: ${chapterCounter} PDFs in ${OUTPUT_DIR_CHAPTERS}/`);
    console.log(`   - Individual Mishnayot: ${mishnahCounter} PDFs in ${OUTPUT_DIR_SINGLE}/`);
    console.log(`\n✅ Ready for S3 upload!`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
