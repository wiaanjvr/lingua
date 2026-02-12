#!/bin/bash

# Quick TTS Audio Generation Script
# Generates the 3 mock audio files using Edge TTS (100% free, no API key needed)

echo "🎙️  Generating French audio files with Edge TTS..."
echo ""

# Check if edge-tts is installed
if ! command -v edge-tts &> /dev/null; then
    echo "Installing edge-tts..."
    pip install edge-tts
fi

# Create audio directory if it doesn't exist
mkdir -p public/audio

# Generate Philosophy segment (Female voice)
echo "📚 Generating: philosophy_intro_1.mp3"
edge-tts --voice fr-FR-DeniseNeural \
  --text "Bonjour. Aujourd'hui, nous allons parler de la philosophie. La philosophie est l'amour de la sagesse. C'est une manière de penser sur le monde, sur nous-mêmes, et sur la vie. Beaucoup de gens pensent que la philosophie est difficile, mais ce n'est pas vrai. La philosophie commence avec une simple question : Pourquoi ?" \
  --rate=-10% \
  --write-media public/audio/philosophy_intro_1.mp3

# Generate Fitness segment (Male voice)
echo "💪 Generating: fitness_basics_1.mp3"
edge-tts --voice fr-FR-HenriNeural \
  --text "Le corps humain est magnifique. Pour rester en bonne santé, nous devons bouger chaque jour. Marcher est simple et très bon pour le cœur. Courir développe la force. Respirer profondément calme l'esprit. Votre corps vous remercie quand vous prenez soin de lui." \
  --rate=-10% \
  --write-media public/audio/fitness_basics_1.mp3

# Generate Science segment (Female voice)
echo "🔬 Generating: science_curiosity_1.mp3"
edge-tts --voice fr-FR-DeniseNeural \
  --text "La science est une aventure. C'est observer le monde avec curiosité. Un scientifique pose des questions. Il fait des expériences pour trouver des réponses. La méthode scientifique est simple : observer, questionner, tester, apprendre. Même les enfants sont des scientifiques naturels. Ils explorent, ils découvrent, ils comprennent." \
  --rate=-10% \
  --write-media public/audio/science_curiosity_1.mp3

echo ""
echo "✅ All audio files generated successfully!"
echo ""
echo "📁 Files created in: public/audio/"
echo "   - philosophy_intro_1.mp3"
echo "   - fitness_basics_1.mp3"
echo "   - science_curiosity_1.mp3"
echo ""
echo "🚀 You can now test the learning session at http://localhost:3000/learn/session"
