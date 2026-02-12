#!/usr/bin/env python3
"""
Generate French audio files for Lingua using Google Cloud TTS
Free tier: 4 million characters/month for WaveNet voices
"""

import os
from google.cloud import texttospeech

# Set up client
client = texttospeech.TextToSpeechClient()

# French voice configuration
voice = texttospeech.VoiceSelectionParams(
    language_code="fr-FR",
    name="fr-FR-Neural2-A",  # Female voice, natural sounding
    # Alternative voices:
    # "fr-FR-Neural2-B" - Male
    # "fr-FR-Neural2-C" - Female
    # "fr-FR-Neural2-D" - Male
)

audio_config = texttospeech.AudioConfig(
    audio_encoding=texttospeech.AudioEncoding.MP3,
    speaking_rate=0.9,  # Slightly slower for learners
    pitch=0.0,
)

# Content to generate (from src/lib/content/engine.ts)
segments = [
    {
        "filename": "philosophy_intro_1.mp3",
        "text": """Bonjour. Aujourd'hui, nous allons parler de la philosophie. 
        La philosophie est l'amour de la sagesse. C'est une manière de penser 
        sur le monde, sur nous-mêmes, et sur la vie. Beaucoup de gens pensent 
        que la philosophie est difficile, mais ce n'est pas vrai. La philosophie 
        commence avec une simple question : Pourquoi ?"""
    },
    {
        "filename": "fitness_basics_1.mp3",
        "text": """Le corps humain est magnifique. Pour rester en bonne santé, 
        nous devons bouger chaque jour. Marcher est simple et très bon pour le cœur. 
        Courir développe la force. Respirer profondément calme l'esprit. Votre corps 
        vous remercie quand vous prenez soin de lui."""
    },
    {
        "filename": "science_curiosity_1.mp3",
        "text": """La science est une aventure. C'est observer le monde avec curiosité. 
        Un scientifique pose des questions. Il fait des expériences pour trouver des 
        réponses. La méthode scientifique est simple : observer, questionner, tester, 
        apprendre. Même les enfants sont des scientifiques naturels. Ils explorent, 
        ils découvrent, ils comprennent."""
    }
]

# Output directory
output_dir = "public/audio"
os.makedirs(output_dir, exist_ok=True)

# Generate audio files
for segment in segments:
    print(f"Generating {segment['filename']}...")
    
    synthesis_input = texttospeech.SynthesisInput(text=segment['text'])
    
    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )
    
    output_path = os.path.join(output_dir, segment['filename'])
    with open(output_path, 'wb') as out:
        out.write(response.audio_content)
    
    print(f"✓ Created {output_path}")

print("\n✅ All audio files generated successfully!")
