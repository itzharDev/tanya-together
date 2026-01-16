#!/usr/bin/env python3
"""
Generate all Mishnah images in 2 versions:
1. By chapters (525 images) - Full chapter with multiple mishnayot
2. By individual mishnayot (~4,192 images) - One mishnah per image
"""

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import re

# Directories
MISHNAYOT_DIR = Path("mishnayot_texts")
OUTPUT_DIR_CHAPTERS = Path("mishnah_images_chapters")
OUTPUT_DIR_SINGLE = Path("mishnah_images_single")

# Image settings
IMAGE_WIDTH = 800
IMAGE_HEIGHT = 2400  # Increased to fit full chapter text
BACKGROUND_COLOR = (255, 250, 245)  # Warm off-white
TEXT_COLOR = (40, 40, 40)  # Dark gray
HEADER_COLOR = (4, 71, 142)  # Brand blue #04478E
BORDER_COLOR = (4, 71, 142)

# Font settings
TITLE_FONT_SIZE = 48
CHAPTER_FONT_SIZE = 36
TEXT_FONT_SIZE = 32
MISHNAH_NUMBER_FONT_SIZE = 28

# Hebrew tractate names mapping
TRACTATE_HEBREW = {
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
    "Mishnah_Oktzin": "עוקצין",
}

def get_font(size):
    """Try to get Hebrew font, fallback to system fonts"""
    font_options = [
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    
    for font_path in font_options:
        try:
            return ImageFont.truetype(font_path, size)
        except:
            continue
    
    return ImageFont.load_default()

def strip_html_tags(text):
    """Remove HTML tags and entities from text"""
    text = re.sub(r'<[^>]+>', '', text)
    text = ' '.join(text.split())
    return text.strip()

def number_to_hebrew_gematria(num):
    """Convert number to Hebrew gematria letter"""
    hebrew_letters = [
        'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט',  # 1-9
        'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ',  # 10-90
        'ק', 'ר', 'ש', 'ת'  # 100-400
    ]
    
    if num <= 0:
        return ''
    elif num <= 9:
        return hebrew_letters[num - 1]
    elif num == 10:
        return 'י'
    elif num < 20:
        return 'י' + hebrew_letters[num - 11]
    elif num == 20:
        return 'כ'
    elif num < 30:
        return 'כ' + hebrew_letters[num - 21]
    else:
        return hebrew_letters[(num - 1) % 22]

def wrap_hebrew_text(text, font, max_width):
    """Wrap Hebrew text to fit within max_width"""
    words = text.split()
    lines = []
    current_line = []
    
    draw = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        width = bbox[2] - bbox[0]
        
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    
    if current_line:
        lines.append(' '.join(current_line))
    
    return lines

def extract_text_from_chapter(chapter_data):
    """Extract Hebrew text from chapter JSON"""
    try:
        if 'versions' in chapter_data:
            for version in chapter_data['versions']:
                if version.get('language') == 'he':
                    return version.get('text', [])
        
        if 'he' in chapter_data:
            return chapter_data['he']
            
        return []
    except Exception as e:
        print(f"Error extracting text: {e}")
        return []

def create_chapter_image(tractate_name, chapter_num, mishnayot_texts, output_path):
    """Create image for a full chapter with multiple mishnayot"""
    
    img = Image.new('RGB', (IMAGE_WIDTH, IMAGE_HEIGHT), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    title_font = get_font(TITLE_FONT_SIZE)
    chapter_font = get_font(CHAPTER_FONT_SIZE)
    text_font = get_font(TEXT_FONT_SIZE)
    
    # Draw border
    border_margin = 20
    draw.rectangle(
        [border_margin, border_margin, IMAGE_WIDTH - border_margin, IMAGE_HEIGHT - border_margin],
        outline=BORDER_COLOR,
        width=3
    )
    
    y = 60
    padding_x = 60
    
    # Tractate title
    tractate_he = TRACTATE_HEBREW.get(tractate_name, tractate_name.replace("Mishnah_", ""))
    title_text = f"מסכת {tractate_he}"
    
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (IMAGE_WIDTH - title_width) // 2
    draw.text((title_x, y), title_text, fill=HEADER_COLOR, font=title_font)
    y += 70
    
    # Chapter number
    chapter_hebrew_num = number_to_hebrew_gematria(chapter_num)
    chapter_text = f"פרק {chapter_hebrew_num}"
    chapter_bbox = draw.textbbox((0, 0), chapter_text, font=chapter_font)
    chapter_width = chapter_bbox[2] - chapter_bbox[0]
    chapter_x = (IMAGE_WIDTH - chapter_width) // 2
    draw.text((chapter_x, y), chapter_text, fill=HEADER_COLOR, font=chapter_font)
    y += 60
    
    # Separator line
    draw.line([(padding_x, y), (IMAGE_WIDTH - padding_x, y)], fill=BORDER_COLOR, width=2)
    y += 30
    
    # Draw mishnayot
    max_text_width = IMAGE_WIDTH - (padding_x * 2)
    
    for idx, mishnah_text in enumerate(mishnayot_texts, 1):
        if y > IMAGE_HEIGHT - 100:
            break
        
        mishnah_text = strip_html_tags(mishnah_text)
        hebrew_num = number_to_hebrew_gematria(idx)
        mishnah_with_number = f"{hebrew_num}. {mishnah_text}"
        
        lines = wrap_hebrew_text(mishnah_with_number, text_font, max_text_width)
        
        for line in lines:  # Show all lines
            line_bbox = draw.textbbox((0, 0), line, font=text_font)
            line_width = line_bbox[2] - line_bbox[0]
            text_x = IMAGE_WIDTH - padding_x - line_width
            
            draw.text((text_x, y), line, fill=TEXT_COLOR, font=text_font)
            y += 40
        
        y += 20
    
    # Footer
    y = IMAGE_HEIGHT - 60
    footer_text = "מקור: ספריא | Powered by Sefaria.org"
    footer_font = get_font(16)
    footer_bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
    footer_width = footer_bbox[2] - footer_bbox[0]
    footer_x = (IMAGE_WIDTH - footer_width) // 2
    draw.text((footer_x, y), footer_text, fill=(150, 150, 150), font=footer_font)
    
    img.save(output_path, 'PNG', quality=95)

def create_single_mishnah_image(tractate_name, chapter_num, mishnah_num, mishnah_text, output_path):
    """Create image for a single mishnah"""
    
    img = Image.new('RGB', (IMAGE_WIDTH, IMAGE_HEIGHT), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    title_font = get_font(TITLE_FONT_SIZE)
    chapter_font = get_font(CHAPTER_FONT_SIZE)
    text_font = get_font(TEXT_FONT_SIZE)
    
    # Draw border
    border_margin = 20
    draw.rectangle(
        [border_margin, border_margin, IMAGE_WIDTH - border_margin, IMAGE_HEIGHT - border_margin],
        outline=BORDER_COLOR,
        width=3
    )
    
    y = 60
    padding_x = 60
    
    # Tractate title
    tractate_he = TRACTATE_HEBREW.get(tractate_name, tractate_name.replace("Mishnah_", ""))
    title_text = f"מסכת {tractate_he}"
    
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (IMAGE_WIDTH - title_width) // 2
    draw.text((title_x, y), title_text, fill=HEADER_COLOR, font=title_font)
    y += 70
    
    # Chapter and Mishnah number - e.g., "פרק א משנה ג"
    chapter_hebrew_num = number_to_hebrew_gematria(chapter_num)
    mishnah_hebrew_num = number_to_hebrew_gematria(mishnah_num)
    chapter_text = f"פרק {chapter_hebrew_num} משנה {mishnah_hebrew_num}"
    chapter_bbox = draw.textbbox((0, 0), chapter_text, font=chapter_font)
    chapter_width = chapter_bbox[2] - chapter_bbox[0]
    chapter_x = (IMAGE_WIDTH - chapter_width) // 2
    draw.text((chapter_x, y), chapter_text, fill=HEADER_COLOR, font=chapter_font)
    y += 60
    
    # Separator line
    draw.line([(padding_x, y), (IMAGE_WIDTH - padding_x, y)], fill=BORDER_COLOR, width=2)
    y += 40
    
    # Draw mishnah text (no number prefix for single mishnah)
    max_text_width = IMAGE_WIDTH - (padding_x * 2)
    mishnah_text = strip_html_tags(mishnah_text)
    lines = wrap_hebrew_text(mishnah_text, text_font, max_text_width)
    
    for line in lines:
        if y > IMAGE_HEIGHT - 100:
            break
        
        line_bbox = draw.textbbox((0, 0), line, font=text_font)
        line_width = line_bbox[2] - line_bbox[0]
        text_x = IMAGE_WIDTH - padding_x - line_width
        
        draw.text((text_x, y), line, fill=TEXT_COLOR, font=text_font)
        y += 40
    
    # Footer
    y = IMAGE_HEIGHT - 60
    footer_text = "מקור: ספריא | Powered by Sefaria.org"
    footer_font = get_font(16)
    footer_bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
    footer_width = footer_bbox[2] - footer_bbox[0]
    footer_x = (IMAGE_WIDTH - footer_width) // 2
    draw.text((footer_x, y), footer_text, fill=(150, 150, 150), font=footer_font)
    
    img.save(output_path, 'PNG', quality=95)

def main():
    """Generate all Mishnah images in both versions"""
    
    OUTPUT_DIR_CHAPTERS.mkdir(exist_ok=True)
    OUTPUT_DIR_SINGLE.mkdir(exist_ok=True)
    
    print("🎨 Generating ALL Mishnah images...")
    print("📊 2 versions:")
    print("   1. By chapters (525 images)")
    print("   2. By individual mishnayot (~4,192 images)\n")
    
    chapter_counter = 0
    mishnah_counter = 0
    
    # Traditional Mishnah order (6 Sedarim)
    mishnah_order = [
        # סדר זרעים
        "Mishnah_Berakhot", "Mishnah_Peah", "Mishnah_Demai", "Mishnah_Kilayim", 
        "Mishnah_Sheviit", "Mishnah_Terumot", "Mishnah_Maasrot", "Mishnah_Maaser_Sheni", 
        "Mishnah_Challah", "Mishnah_Orlah", "Mishnah_Bikkurim",
        # סדר מועד
        "Mishnah_Shabbat", "Mishnah_Eruvin", "Mishnah_Pesachim", "Mishnah_Shekalim", 
        "Mishnah_Yoma", "Mishnah_Sukkah", "Mishnah_Beitzah", "Mishnah_Rosh_Hashanah", 
        "Mishnah_Taanit", "Mishnah_Megillah", "Mishnah_Moed_Katan", "Mishnah_Chagigah",
        # סדר נשים
        "Mishnah_Yevamot", "Mishnah_Ketubot", "Mishnah_Nedarim", "Mishnah_Nazir", 
        "Mishnah_Sotah", "Mishnah_Gittin", "Mishnah_Kiddushin",
        # סדר נזיקין
        "Mishnah_Bava_Kamma", "Mishnah_Bava_Metzia", "Mishnah_Bava_Batra", 
        "Mishnah_Sanhedrin", "Mishnah_Makkot", "Mishnah_Shevuot", "Mishnah_Eduyot", 
        "Mishnah_Avodah_Zarah", "Mishnah_Avot", "Mishnah_Horayot",
        # סדר קודשים
        "Mishnah_Zevachim", "Mishnah_Menachot", "Mishnah_Chullin", "Mishnah_Bekhorot", 
        "Mishnah_Arakhin", "Mishnah_Temurah", "Mishnah_Keritot", "Mishnah_Meilah", 
        "Mishnah_Tamid", "Mishnah_Middot", "Mishnah_Kinnim",
        # סדר טהרות
        "Mishnah_Kelim", "Mishnah_Oholot", "Mishnah_Negaim", "Mishnah_Parah", 
        "Mishnah_Tahorot", "Mishnah_Mikvaot", "Mishnah_Niddah", "Mishnah_Makhshirin", 
        "Mishnah_Zavim", "Mishnah_Tevul_Yom", "Mishnah_Yadayim", "Mishnah_Oktzin",
    ]
    
    # Process tractates in traditional order
    for tractate_name in mishnah_order:
        tractate_dir = MISHNAYOT_DIR / tractate_name
        
        if not tractate_dir.exists() or not tractate_dir.is_dir():
            print(f"⚠️  Skipping {tractate_name} - not found")
            continue
        
        print(f"\n📖 Processing {tractate_name}...")
        
        # Process each chapter
        for chapter_file in sorted(tractate_dir.glob("chapter_*.json")):
            chapter_num = int(chapter_file.stem.replace("chapter_", ""))
            
            with open(chapter_file, 'r', encoding='utf-8') as f:
                chapter_data = json.load(f)
            
            mishnayot_texts = extract_text_from_chapter(chapter_data)
            
            if not mishnayot_texts:
                continue
            
            # 1. Create chapter image
            chapter_counter += 1
            chapter_output = OUTPUT_DIR_CHAPTERS / f"{chapter_counter}.png"
            create_chapter_image(tractate_name, chapter_num, mishnayot_texts, chapter_output)
            print(f"  ✅ Chapter {chapter_counter}: {tractate_name} פרק {chapter_num}")
            
            # 2. Create individual mishnah images
            for mishnah_idx, mishnah_text in enumerate(mishnayot_texts, 1):
                mishnah_counter += 1
                mishnah_output = OUTPUT_DIR_SINGLE / f"{mishnah_counter}.png"
                create_single_mishnah_image(tractate_name, chapter_num, mishnah_idx, mishnah_text, mishnah_output)
            
            print(f"     + {len(mishnayot_texts)} individual mishnayot")
    
    print(f"\n\n🎉 Done!")
    print(f"📊 Statistics:")
    print(f"   - Chapters: {chapter_counter} images in {OUTPUT_DIR_CHAPTERS}/")
    print(f"   - Individual Mishnayot: {mishnah_counter} images in {OUTPUT_DIR_SINGLE}/")
    print(f"\n✅ Ready for S3 upload!")

if __name__ == "__main__":
    main()
