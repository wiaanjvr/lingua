"""
Audio Generator for Foundation Lessons

This script generates MP3 audio files for all foundation lessons using edge_tts.
It creates natural-sounding French speech for each phrase and response.

Usage:
    python generate_foundation_audio.py

Requirements:
    pip install edge-tts
"""

import asyncio
import edge_tts
import json
import os
from pathlib import Path

# Configuration
VOICE = "fr-FR-DeniseNeural"  # Female French voice, natural and clear
OUTPUT_DIR = Path("public/audio")
FOUNDATION_DIR = OUTPUT_DIR / "foundation"
SINGLE_DIR = OUTPUT_DIR / "single"

# Read the foundation lessons JSON
with open("src/data/foundation-lessons.json", "r", encoding="utf-8") as f:
    lessons = json.load(f)


def sanitize_filename(text):
    """Convert French text to a safe filename"""
    return (
        text.lower()
        .replace("'", "_")
        .replace("?", "")
        .replace("!", "")
        .replace(" ", "_")
        .replace(".", "")
        .replace(",", "")
        + ".mp3"
    )


async def generate_audio(text, output_path):
    """Generate MP3 audio file for given text"""
    print(f"Generating: {output_path}")
    
    # Create the communicate object
    communicate = edge_tts.Communicate(text, VOICE)
    
    # Save to file
    await communicate.save(str(output_path))
    print(f"✓ Created: {output_path.name}")


async def generate_all_audio():
    """Generate audio for all lessons and responses"""
    
    # Create output directories
    FOUNDATION_DIR.mkdir(parents=True, exist_ok=True)
    SINGLE_DIR.mkdir(parents=True, exist_ok=True)
    
    tasks = []
    
    for lesson in lessons:
        french_text = lesson["phrase_french"] if "phrase_french" in lesson else lesson["sentence_french"]
        phase = lesson["phase"]
        
        # Determine the correct directory
        output_dir = FOUNDATION_DIR if phase == "foundation" else SINGLE_DIR
        
        # Generate main phrase/sentence audio
        filename = sanitize_filename(french_text)
        output_path = output_dir / filename
        
        if not output_path.exists():
            tasks.append(generate_audio(french_text, output_path))
        else:
            print(f"⊘ Skipping existing file: {filename}")
        
        # Generate practice/response audio
        if "practice_sentences" in lesson:
            for practice in lesson["practice_sentences"]:
                practice_text = practice["french"]
                filename = sanitize_filename(practice_text)
                output_path = output_dir / filename
                
                if not output_path.exists():
                    tasks.append(generate_audio(practice_text, output_path))
                else:
                    print(f"⊘ Skipping existing file: {filename}")
        
        if "response_options" in lesson:
            for response in lesson["response_options"]:
                response_text = response["french"]
                filename = sanitize_filename(response_text)
                output_path = output_dir / filename
                
                if not output_path.exists():
                    tasks.append(generate_audio(response_text, output_path))
                else:
                    print(f"⊘ Skipping existing file: {filename}")
    
    # Generate all audio files concurrently (in batches to avoid overload)
    batch_size = 5
    for i in range(0, len(tasks), batch_size):
        batch = tasks[i:i+batch_size]
        await asyncio.gather(*batch)
        print(f"\nCompleted batch {i//batch_size + 1}/{(len(tasks)-1)//batch_size + 1}\n")
    
    print(f"\n✅ Audio generation complete!")
    print(f"Foundation phrases: {len(list(FOUNDATION_DIR.glob('*.mp3')))} files")
    print(f"Single sentences: {len(list(SINGLE_DIR.glob('*.mp3')))} files")


if __name__ == "__main__":
    print("=" * 60)
    print("Foundation Lessons Audio Generator")
    print("=" * 60)
    print(f"\nVoice: {VOICE}")
    print(f"Output: {OUTPUT_DIR}\n")
    
    asyncio.run(generate_all_audio())
