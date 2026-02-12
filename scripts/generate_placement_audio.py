#!/usr/bin/env python3
"""
Generate French audio files for Lingua Placement Test using OpenAI TTS
Run this script to create the 5 audio clips for the placement assessment.

Usage:
  python scripts/generate_placement_audio.py

Requirements:
  - OpenAI API key in .env.local file or OPENAI_API_KEY environment variable
  - pip install openai python-dotenv
"""

import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
import ssl
import httpx
import warnings

# Suppress SSL warnings for local development
warnings.filterwarnings('ignore', message='Unverified HTTPS request')
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load environment variables from .env.local
dotenv_path = Path(__file__).parent.parent / '.env.local'
if dotenv_path.exists():
    load_dotenv(dotenv_path)
    print(f"✓ Loaded API key from {dotenv_path}")
else:
    print(f"⚠ No .env.local file found at {dotenv_path}")
    print("  Using OPENAI_API_KEY environment variable if set")

# Initialize OpenAI client with SSL verification disabled (for local dev only)
try:
    # Create a custom HTTP client that doesn't verify SSL (local dev workaround)
    http_client = httpx.Client(
        verify=False,  # Disable SSL verification for local dev
        timeout=60.0
    )
    client = OpenAI(http_client=http_client)
    print("✓ OpenAI client initialized (SSL verification disabled for local use)")
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nTo fix this:")
    print("1. Copy .env.local.example to .env.local")
    print("2. Add your OpenAI API key to the OPENAI_API_KEY field")
    print("3. Get your key from: https://platform.openai.com/api-keys")
    exit(1)

# Placement test audio content (varying difficulty A1-C1)
# Each should be about 10 seconds when read naturally
placement_audio = [
    {
        "id": "audio-a1",
        "filename": "audio-a1.mp3",
        "difficulty": "A1",
        "text": "Bonjour, je m'appelle Marie. J'ai vingt ans.",
    },
    {
        "id": "audio-a2",
        "filename": "audio-a2.mp3",
        "difficulty": "A2",
        "text": "Ce matin, je suis allé au marché pour acheter des fruits et des légumes.",
    },
    {
        "id": "audio-b1",
        "filename": "audio-b1.mp3",
        "difficulty": "B1",
        "text": "Le rapport indique que les ventes ont augmenté de quinze pour cent ce trimestre par rapport à l'année dernière.",
    },
    {
        "id": "audio-b2",
        "filename": "audio-b2.mp3",
        "difficulty": "B2",
        "text": "Bien que la situation économique soit préoccupante, les experts estiment qu'une reprise progressive est envisageable d'ici la fin de l'année.",
    },
    {
        "id": "audio-c1",
        "filename": "audio-c1.mp3",
        "difficulty": "C1",
        "text": "L'émergence des technologies disruptives a fondamentalement bouleversé les paradigmes traditionnels qui régissaient jusqu'alors le secteur industriel.",
    },
]

# Output directory
output_dir = "public/audio/placement"
os.makedirs(output_dir, exist_ok=True)

print("=" * 50)
print("Generating Placement Test Audio Files")
print("=" * 50)

# Generate audio files
for item in placement_audio:
    print(f"\n[{item['difficulty']}] Generating {item['filename']}...")
    print(f"    Text: {item['text'][:50]}...")
    
    # Generate speech using OpenAI TTS
    output_path = os.path.join(output_dir, item['filename'])
    
    with client.audio.speech.with_streaming_response.create(
        model="tts-1",  # or "tts-1-hd" for higher quality
        voice="nova",  # Female voice - alternatives: alloy, echo, fable, onyx, nova, shimmer
        input=item['text'],
        speed=0.9  # Slightly slower for learners
    ) as response:
        response.stream_to_file(output_path)
    
    # Get file size
    file_size = os.path.getsize(output_path)
    print(f"    ✓ Created {output_path} ({file_size / 1024:.1f} KB)")

print("\n" + "=" * 50)
print("✅ All placement test audio files generated!")
print(f"   Location: {os.path.abspath(output_dir)}")
print("=" * 50)
