#!/usr/bin/env python3
"""
Generate beautiful Hebrew Mishnah images from JSON files
This test version generates 3 examples for approval before processing all files
"""

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap
import re

# Directories
MISHNAYOT_DIR = Path("mishnayot_texts")
OUTPUT_DIR = Path("mishnah_images_test")

# Image settings
IMAGE_WIDTH = 800
IMAGE_HEIGHT = 1200
BACKGROUND_COLOR = (255, 250, 245)  # Warm off-white
TEXT_COLOR = (40, 40, 40)  # Dark gray (softer than black)
HEADER_COLOR = (4, 71, 142)  # Your brand blue #04478E
BORDER_COLOR = (4, 71, 142)

# Font settings (system fonts that work on macOS)
TITLE_FONT_SIZE = 48
CHAPTER_FONT_SIZE = 36
TEXT_FONT_SIZE = 32
MISHNAH_NUMBER_FONT_SIZE = 28

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
    
    # Fallback to default
    return ImageFont.load_default()

def strip_html_tags(text):
    """Remove HTML tags and entities from text"""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text.strip()

def number_to_hebrew_gematria(num):
    """Convert number to Hebrew gematria letter"""
    # Hebrew letters for numbers 1-22
    hebrew_letters = [
        'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט',  # 1-9
        'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ',  # 10-90 (by 10s)
        'ק', 'ר', 'ש', 'ת'  # 100-400 (by 100s)
    ]
    
    if num <= 0:
        return ''
    elif num <= 9:
        return hebrew_letters[num - 1]
    elif num == 10:
        return 'י'
    elif num < 20:
        # 11-19: יא, יב, יג...
        return 'י' + hebrew_letters[num - 11]
    elif num == 20:
        return 'כ'
    elif num < 30:
        # 21-29: כא, כב, כג...
        return 'כ' + hebrew_letters[num - 21]
    else:
        # For larger numbers, just use the first 22 letters cyclically
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
    """Extract Hebrew text and metadata from chapter JSON"""
    try:
        # Navigate the JSON structure to find Hebrew text
        if 'versions' in chapter_data:
            for version in chapter_data['versions']:
                if version.get('language') == 'he':
                    text_sections = version.get('text', [])
                    return text_sections
        
        # Alternative structure
        if 'he' in chapter_data:
            return chapter_data['he']
            
        return []
    except Exception as e:
        print(f"Error extracting text: {e}")
        return []

def create_mishnah_image(tractate_name, chapter_num, mishnayot_texts, output_path):
    """Create a beautiful image for one chapter of Mishnah"""
    
    # Create image
    img = Image.new('RGB', (IMAGE_WIDTH, IMAGE_HEIGHT), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Load fonts
    title_font = get_font(TITLE_FONT_SIZE)
    chapter_font = get_font(CHAPTER_FONT_SIZE)
    text_font = get_font(TEXT_FONT_SIZE)
    number_font = get_font(MISHNAH_NUMBER_FONT_SIZE)
    
    # Draw border
    border_margin = 20
    draw.rectangle(
        [border_margin, border_margin, IMAGE_WIDTH - border_margin, IMAGE_HEIGHT - border_margin],
        outline=BORDER_COLOR,
        width=3
    )
    
    # Current Y position
    y = 60
    padding_x = 60
    
    # Title - Tractate name (Hebrew only)
    # Map English names to Hebrew
    tractate_hebrew = {
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
    
    tractate_he = tractate_hebrew.get(tractate_name, tractate_name.replace("Mishnah_", "").replace("_", " "))
    title_text = f"מסכת {tractate_he}"
    
    # Draw title
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (IMAGE_WIDTH - title_width) // 2
    draw.text((title_x, y), title_text, fill=HEADER_COLOR, font=title_font)
    y += 70
    
    # Chapter number - Hebrew gematria
    chapter_hebrew_num = number_to_hebrew_gematria(chapter_num)
    chapter_text = f"פרק {chapter_hebrew_num}"
    chapter_bbox = draw.textbbox((0, 0), chapter_text, font=chapter_font)
    chapter_width = chapter_bbox[2] - chapter_bbox[0]
    chapter_x = (IMAGE_WIDTH - chapter_width) // 2
    draw.text((chapter_x, y), chapter_text, fill=HEADER_COLOR, font=chapter_font)
    y += 60
    
    # Draw separator line
    draw.line([(padding_x, y), (IMAGE_WIDTH - padding_x, y)], fill=BORDER_COLOR, width=2)
    y += 30
    
    # Draw each Mishnah
    max_text_width = IMAGE_WIDTH - (padding_x * 2)
    
    for idx, mishnah_text in enumerate(mishnayot_texts[:5], 1):  # Show first 5 mishnayot
        if y > IMAGE_HEIGHT - 100:  # Stop if we're running out of space
            break
        
        # Strip HTML tags from the text
        mishnah_text = strip_html_tags(mishnah_text)
        
        # Add Hebrew gematria letter at the beginning
        hebrew_num = number_to_hebrew_gematria(idx)
        mishnah_with_number = f"{hebrew_num}. {mishnah_text}"
        
        # Wrap and draw text (RTL)
        lines = wrap_hebrew_text(mishnah_with_number, text_font, max_text_width)
        
        for line in lines[:3]:  # Max 3 lines per mishnah to save space
            # Right-align for Hebrew (RTL)
            line_bbox = draw.textbbox((0, 0), line, font=text_font)
            line_width = line_bbox[2] - line_bbox[0]
            text_x = IMAGE_WIDTH - padding_x - line_width
            
            draw.text((text_x, y), line, fill=TEXT_COLOR, font=text_font)
            y += 40
        
        if len(lines) > 3:
            # Add "..." if text was truncated
            draw.text((IMAGE_WIDTH - padding_x - 30, y - 40), "...", fill=TEXT_COLOR, font=text_font, anchor="ra")
        
        y += 20  # Space between mishnayot
    
    # Footer - Attribution
    y = IMAGE_HEIGHT - 60
    footer_text = "מקור: ספריא | Powered by Sefaria.org"
    footer_font = get_font(16)
    footer_bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
    footer_width = footer_bbox[2] - footer_bbox[0]
    footer_x = (IMAGE_WIDTH - footer_width) // 2
    draw.text((footer_x, y), footer_text, fill=(150, 150, 150), font=footer_font)
    
    # Save image
    img.save(output_path, 'PNG', quality=95)
    print(f"✅ Created: {output_path.name}")

def main():
    """Generate 3 test images"""
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    print("🎨 Generating 3 test Mishnah images...\n")
    
    # Test with 3 different tractates/chapters
    test_cases = [
        ("Mishnah_Berakhot", 1),  # First tractate, first chapter
        ("Mishnah_Shabbat", 1),   # Popular tractate
        ("Mishnah_Avot", 1),      # Pirkei Avot - Ethics of the Fathers
    ]
    
    for tractate_name, chapter_num in test_cases:
        # Load chapter JSON
        chapter_file = MISHNAYOT_DIR / tractate_name / f"chapter_{chapter_num}.json"
        
        if not chapter_file.exists():
            print(f"⚠️  File not found: {chapter_file}")
            continue
        
        with open(chapter_file, 'r', encoding='utf-8') as f:
            chapter_data = json.load(f)
        
        # Extract text
        mishnayot_texts = extract_text_from_chapter(chapter_data)
        
        if not mishnayot_texts:
            print(f"⚠️  No text found in {tractate_name} chapter {chapter_num}")
            continue
        
        # Create image
        output_file = OUTPUT_DIR / f"test_{tractate_name}_{chapter_num}.png"
        create_mishnah_image(tractate_name, chapter_num, mishnayot_texts, output_file)
    
    print(f"\n🎉 Done! Check the test images in: {OUTPUT_DIR.absolute()}")
    print("\n📁 Generated files:")
    for img_file in sorted(OUTPUT_DIR.glob("*.png")):
        print(f"   - {img_file.name}")
    print("\n👀 Please review these images and let me know if you want any changes!")
    print("   (font size, colors, layout, spacing, etc.)")

if __name__ == "__main__":
    main()
