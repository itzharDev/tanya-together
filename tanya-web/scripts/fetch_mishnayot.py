#!/usr/bin/env python3
"""
Fetch all Mishnayot texts from Sefaria API
https://developers.sefaria.org/docs/api-documentation

IMPORTANT: 
- Sefaria's content is licensed under CC BY-NC 4.0
- You MUST attribute Sefaria in your app
- Use responsibly and don't overwhelm their servers
"""

import requests
import json
import time
import os
from pathlib import Path

# List of all 63 Mishnah tractates in order
MISHNAH_TRACTATES = [
    # Seder Zeraim (11 tractates)
    "Mishnah_Berakhot",
    "Mishnah_Peah",
    "Mishnah_Demai",
    "Mishnah_Kilayim",
    "Mishnah_Sheviit",
    "Mishnah_Terumot",
    "Mishnah_Maasrot",
    "Mishnah_Maaser_Sheni",
    "Mishnah_Challah",
    "Mishnah_Orlah",
    "Mishnah_Bikkurim",
    
    # Seder Moed (12 tractates)
    "Mishnah_Shabbat",
    "Mishnah_Eruvin",
    "Mishnah_Pesachim",
    "Mishnah_Shekalim",
    "Mishnah_Yoma",
    "Mishnah_Sukkah",
    "Mishnah_Beitzah",
    "Mishnah_Rosh_Hashanah",
    "Mishnah_Taanit",
    "Mishnah_Megillah",
    "Mishnah_Moed_Katan",
    "Mishnah_Chagigah",
    
    # Seder Nashim (7 tractates)
    "Mishnah_Yevamot",
    "Mishnah_Ketubot",
    "Mishnah_Nedarim",
    "Mishnah_Nazir",
    "Mishnah_Sotah",
    "Mishnah_Gittin",
    "Mishnah_Kiddushin",
    
    # Seder Nezikin (10 tractates)
    "Mishnah_Bava_Kamma",
    "Mishnah_Bava_Metzia",
    "Mishnah_Bava_Batra",
    "Mishnah_Sanhedrin",
    "Mishnah_Makkot",
    "Mishnah_Shevuot",
    "Mishnah_Eduyot",
    "Mishnah_Avodah_Zarah",
    "Mishnah_Avot",
    "Mishnah_Horayot",
    
    # Seder Kodashim (11 tractates)
    "Mishnah_Zevachim",
    "Mishnah_Menachot",
    "Mishnah_Chullin",
    "Mishnah_Bekhorot",
    "Mishnah_Arakhin",
    "Mishnah_Temurah",
    "Mishnah_Keritot",
    "Mishnah_Meilah",
    "Mishnah_Tamid",
    "Mishnah_Middot",
    "Mishnah_Kinnim",
    
    # Seder Tahorot (12 tractates)
    "Mishnah_Kelim",
    "Mishnah_Oholot",
    "Mishnah_Negaim",
    "Mishnah_Parah",
    "Mishnah_Tahorot",
    "Mishnah_Mikvaot",
    "Mishnah_Niddah",
    "Mishnah_Makhshirin",
    "Mishnah_Zavim",
    "Mishnah_Tevul_Yom",
    "Mishnah_Yadayim",
    "Mishnah_Oktzin",
]

BASE_URL = "https://www.sefaria.org.il/api/v3/texts"
OUTPUT_DIR = Path("mishnayot_texts")

def fetch_index(tractate_name):
    """Fetch the index/structure of a tractate to know how many chapters it has"""
    url = f"https://www.sefaria.org.il/api/v2/index/{tractate_name}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Get the number of chapters from the schema
        if 'schema' in data:
            schema = data['schema']
            if 'lengths' in schema and len(schema['lengths']) > 0:
                return schema['lengths'][0]  # Number of chapters
        
        return None
    except Exception as e:
        print(f"Error fetching index for {tractate_name}: {e}")
        return None

def fetch_chapter(tractate_name, chapter_num):
    """Fetch a specific chapter of a tractate"""
    url = f"{BASE_URL}/{tractate_name}.{chapter_num}"
    params = {
        "version": "hebrew|Torat Emet 357",
        "fill_in_missing_segments": 1,
        "return_format": "wrap_all_entities"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching {tractate_name}.{chapter_num}: {e}")
        return None

def save_tractate_data(tractate_name, chapters_data):
    """Save all chapters of a tractate to a JSON file"""
    tractate_dir = OUTPUT_DIR / tractate_name
    tractate_dir.mkdir(parents=True, exist_ok=True)
    
    # Save each chapter
    for chapter_num, chapter_data in chapters_data.items():
        if chapter_data:
            chapter_file = tractate_dir / f"chapter_{chapter_num}.json"
            with open(chapter_file, 'w', encoding='utf-8') as f:
                json.dump(chapter_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Saved {tractate_name} ({len(chapters_data)} chapters)")

def main():
    """Main function to fetch all Mishnayot"""
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    print("🚀 Starting Mishnayot fetch from Sefaria API")
    print(f"📁 Output directory: {OUTPUT_DIR.absolute()}")
    print(f"📚 Total tractates to fetch: {len(MISHNAH_TRACTATES)}\n")
    
    total_chapters = 0
    
    for idx, tractate in enumerate(MISHNAH_TRACTATES, 1):
        print(f"\n[{idx}/{len(MISHNAH_TRACTATES)}] Fetching {tractate}...")
        
        # Get the number of chapters in this tractate
        num_chapters = fetch_index(tractate)
        if not num_chapters:
            print(f"⚠️  Could not determine chapter count for {tractate}, skipping...")
            continue
        
        print(f"  📖 Found {num_chapters} chapters")
        
        # Fetch all chapters
        chapters_data = {}
        for chapter_num in range(1, num_chapters + 1):
            print(f"  ⏳ Fetching chapter {chapter_num}/{num_chapters}...", end='\r')
            chapter_data = fetch_chapter(tractate, chapter_num)
            if chapter_data:
                chapters_data[chapter_num] = chapter_data
                total_chapters += 1
            
            # Be respectful - don't overwhelm the server
            time.sleep(0.5)
        
        print(f"  ✅ Fetched {len(chapters_data)} chapters")
        
        # Save the tractate data
        save_tractate_data(tractate, chapters_data)
        
        # Pause between tractates
        time.sleep(1)
    
    print(f"\n\n🎉 Done! Fetched {total_chapters} chapters from {len(MISHNAH_TRACTATES)} tractates")
    print(f"📁 All data saved to: {OUTPUT_DIR.absolute()}")
    print("\n⚠️  IMPORTANT: Remember to attribute Sefaria in your app!")
    print("    Sefaria data is licensed under CC BY-NC 4.0")
    print("    See: https://www.sefaria.org/licensing")

if __name__ == "__main__":
    main()
