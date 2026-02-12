# Free Voice Model Options for Lingua

Here are the best **free** text-to-speech (TTS) solutions for generating French audio content.

---

## Option 1: Google Cloud TTS (Best Quality, Free Tier)

### Free Tier Limits

- **1 million characters/month** for WaveNet voices (high quality)
- **4 million characters/month** for Standard voices
- Perfect for generating all your content

### Setup (10 minutes)

1. **Create Google Cloud Account**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project: "lingua-tts"
   - Enable Cloud Text-to-Speech API

2. **Install and Configure**

   ```bash
   # Install Google Cloud CLI
   # Download from: https://cloud.google.com/sdk/docs/install

   # Authenticate
   gcloud auth login
   gcloud config set project lingua-tts

   # Create service account key (for Node.js use)
   gcloud iam service-accounts create tts-service
   gcloud iam service-accounts keys create key.json \
     --iam-account=tts-service@lingua-tts.iam.gserviceaccount.com
   ```

3. **Generate Audio (CLI)**

   ```bash
   # Philosophy segment example
   gcloud text-to-speech synthesize-text \
     --text="Bonjour. Aujourd'hui, nous allons parler de la philosophie..." \
     --output=public/audio/philosophy_intro_1.mp3 \
     --voice=fr-FR-Neural2-A \
     --language-code=fr-FR
   ```

4. **Generate Audio (Node.js Script)**

   Create `scripts/generate-audio.js`:

   ```javascript
   const textToSpeech = require("@google-cloud/text-to-speech");
   const fs = require("fs");
   const util = require("util");

   const client = new textToSpeech.TextToSpeechClient();

   async function generateAudio(
     text,
     outputFile,
     voiceName = "fr-FR-Neural2-A",
   ) {
     const request = {
       input: { text },
       voice: {
         languageCode: "fr-FR",
         name: voiceName,
         ssmlGender: "NEUTRAL",
       },
       audioConfig: {
         audioEncoding: "MP3",
         speakingRate: 0.9, // Slightly slower for learners
         pitch: 0.0,
       },
     };

     const [response] = await client.synthesizeSpeech(request);
     await util.promisify(fs.writeFile)(
       outputFile,
       response.audioContent,
       "binary",
     );
     console.log(`✓ Generated: ${outputFile}`);
   }

   // Generate all mock content
   const segments = [
     {
       text: "Bonjour. Aujourd'hui, nous allons parler de la philosophie. La philosophie est l'amour de la sagesse. C'est une manière de penser sur le monde, sur nous-mêmes, et sur la vie. Beaucoup de gens pensent que la philosophie est difficile, mais ce n'est pas vrai. La philosophie commence avec une simple question : Pourquoi ?",
       output: "public/audio/philosophy_intro_1.mp3",
       voice: "fr-FR-Neural2-A", // Female voice
     },
     {
       text: "Le corps humain est magnifique. Pour rester en bonne santé, nous devons bouger chaque jour. Marcher est simple et très bon pour le cœur. Courir développe la force. Respirer profondément calme l'esprit. Votre corps vous remercie quand vous prenez soin de lui.",
       output: "public/audio/fitness_basics_1.mp3",
       voice: "fr-FR-Neural2-B", // Male voice
     },
     {
       text: "La science est une aventure. C'est observer le monde avec curiosité. Un scientifique pose des questions. Il fait des expériences pour trouver des réponses. La méthode scientifique est simple : observer, questionner, tester, apprendre. Même les enfants sont des scientifiques naturels. Ils explorent, ils découvrent, ils comprennent.",
       output: "public/audio/science_curiosity_1.mp3",
       voice: "fr-FR-Neural2-A",
     },
   ];

   (async () => {
     for (const segment of segments) {
       await generateAudio(segment.text, segment.output, segment.voice);
     }
     console.log("\n✓ All audio files generated!");
   })();
   ```

   Install dependency and run:

   ```bash
   npm install @google-cloud/text-to-speech
   export GOOGLE_APPLICATION_CREDENTIALS="./key.json"  # or set in .env
   node scripts/generate-audio.js
   ```

### Best French Voices (Google Cloud)

- `fr-FR-Neural2-A` - Female, natural
- `fr-FR-Neural2-B` - Male, natural
- `fr-FR-Neural2-C` - Female, conversational
- `fr-FR-Neural2-D` - Male, conversational

---

## Option 2: Microsoft Azure TTS (Most Generous Free Tier)

### Free Tier Limits

- **5 million characters/month** for neural voices
- **500,000 characters/month** free forever (after trial)
- Extremely generous for a language learning app

### Setup

1. **Create Azure Account**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Create Speech Service resource
   - Get your API key and region

2. **Install SDK**

   ```bash
   npm install microsoft-cognitiveservices-speech-sdk
   ```

3. **Generate Audio Script**

   Create `scripts/generate-audio-azure.js`:

   ```javascript
   const sdk = require("microsoft-cognitiveservices-speech-sdk");
   const fs = require("fs");

   const speechConfig = sdk.SpeechConfig.fromSubscription(
     process.env.AZURE_SPEECH_KEY,
     process.env.AZURE_SPEECH_REGION,
   );

   async function generateAudio(
     text,
     outputFile,
     voiceName = "fr-FR-DeniseNeural",
   ) {
     speechConfig.speechSynthesisVoiceName = voiceName;

     const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputFile);
     const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

     return new Promise((resolve, reject) => {
       synthesizer.speakTextAsync(
         text,
         (result) => {
           synthesizer.close();
           if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
             console.log(`✓ Generated: ${outputFile}`);
             resolve();
           } else {
             reject(new Error("Synthesis failed"));
           }
         },
         (error) => {
           synthesizer.close();
           reject(error);
         },
       );
     });
   }

   // Use same segments array as Google example
   ```

4. **Run**
   ```bash
   export AZURE_SPEECH_KEY="your-key"
   export AZURE_SPEECH_REGION="eastus"
   node scripts/generate-audio-azure.js
   ```

### Best French Voices (Azure)

- `fr-FR-DeniseNeural` - Female, warm
- `fr-FR-HenriNeural` - Male, clear
- `fr-FR-RemyMultilingualNeural` - Male, multilingual

---

## Option 3: Web Speech API (100% Free, No API Needed)

### Pros

- Completely free, no limits
- No API keys required
- Runs in browser
- Zero setup

### Cons

- Quality varies by browser
- Requires user interaction to start
- Can't pre-generate audio files

### Implementation

Add to your AudioPlayer component for **regenerative TTS**:

```typescript
// src/components/learning/AudioPlayer.tsx

'use client';

import { useState, useEffect } from 'react';

export function TTSAudioPlayer({
  transcript,
  language = 'fr-FR'
}: {
  transcript: string;
  language?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices.filter(v => v.lang.startsWith('fr')));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.lang = language;
      utterance.rate = 0.85; // Slower for learners
      utterance.pitch = 1.0;

      // Select best French voice
      const frenchVoice = voices.find(v =>
        v.lang === 'fr-FR' && v.name.includes('Google')
      ) || voices[0];

      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);

      window.speechSynthesis.cancel(); // Stop any ongoing speech
      window.speechSynthesis.speak(utterance);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div>
      <button onClick={isPlaying ? stop : speak}>
        {isPlaying ? 'Stop' : 'Listen (TTS)'}
      </button>
      <p className="text-sm text-muted-foreground">
        Using browser voice: {voices[0]?.name || 'Default'}
      </p>
    </div>
  );
}
```

**Use Case**: Great for **quick testing** or as a **fallback** when audio files aren't available.

---

## Option 4: Coqui TTS (Open Source, Self-Hosted)

### Pros

- 100% free
- Run on your own machine
- Good quality multi-speaker models
- No API limits

### Cons

- Requires Python
- Slower generation
- Need to host files after generation

### Setup

```bash
# Install Coqui TTS
pip install TTS

# List available French models
tts --list_models | grep fr

# Generate audio
tts --text "Bonjour, comment allez-vous?" \
    --model_name "tts_models/fr/mai/tacotron2-DDC" \
    --out_path output.wav

# Convert to MP3
ffmpeg -i output.wav -codec:a libmp3lame -b:a 128k output.mp3
```

### Python Script for Batch Generation

```python
# scripts/generate_audio_coqui.py
from TTS.api import TTS
import os

# Initialize TTS with French model
tts = TTS(model_name="tts_models/fr/mai/tacotron2-DDC")

segments = [
    {
        "text": "Bonjour. Aujourd'hui, nous allons parler de la philosophie...",
        "output": "public/audio/philosophy_intro_1.wav"
    },
    # ... more segments
]

os.makedirs("public/audio", exist_ok=True)

for segment in segments:
    print(f"Generating {segment['output']}...")
    tts.tts_to_file(
        text=segment['text'],
        file_path=segment['output']
    )
    print(f"✓ Done")

print("\n✓ All files generated!")
print("Convert to MP3 with: ffmpeg -i input.wav -b:a 128k output.mp3")
```

---

## Option 5: Edge TTS (Free, Command Line)

Microsoft Edge's TTS engine, completely free via command line:

```bash
# Install
pip install edge-tts

# Generate audio
edge-tts --voice fr-FR-DeniseNeural \
         --text "Bonjour, bienvenue dans cette leçon" \
         --write-media public/audio/test.mp3

# List all French voices
edge-tts --list-voices | grep fr-FR
```

**Perfect for**: Quick batch generation without Azure account setup.

---

## Recommendation: Best Free Setup

For your use case, I recommend this hybrid approach:

### For MVP/Testing (Right Now)

1. **Edge TTS** - Start here, zero setup
   ```bash
   pip install edge-tts
   edge-tts --voice fr-FR-DeniseNeural --text "..." --write-media file.mp3
   ```

### For Production (After Launch)

2. **Google Cloud TTS** - 1M chars/month free
   - High quality Neural2 voices
   - Easy integration
   - Reliable service
   - Upgrade path if needed

### As Fallback (Always Available)

3. **Web Speech API** - Browser-based TTS
   - No cost
   - Works when audio files fail to load
   - Good for demo/testing

---

## Quick Start: Generate Your 3 Audio Files Now

Create `scripts/quick-tts.sh`:

```bash
#!/bin/bash

# Install edge-tts if needed
pip install edge-tts

# Generate all 3 files
edge-tts --voice fr-FR-DeniseNeural \
  --text "Bonjour. Aujourd'hui, nous allons parler de la philosophie. La philosophie est l'amour de la sagesse. C'est une manière de penser sur le monde, sur nous-mêmes, et sur la vie. Beaucoup de gens pensent que la philosophie est difficile, mais ce n'est pas vrai. La philosophie commence avec une simple question : Pourquoi ?" \
  --write-media public/audio/philosophy_intro_1.mp3

edge-tts --voice fr-FR-HenriNeural \
  --text "Le corps humain est magnifique. Pour rester en bonne santé, nous devons bouger chaque jour. Marcher est simple et très bon pour le cœur. Courir développe la force. Respirer profondément calme l'esprit. Votre corps vous remercie quand vous prenez soin de lui." \
  --write-media public/audio/fitness_basics_1.mp3

edge-tts --voice fr-FR-DeniseNeural \
  --text "La science est une aventure. C'est observer le monde avec curiosité. Un scientifique pose des questions. Il fait des expériences pour trouver des réponses. La méthode scientifique est simple : observer, questionner, tester, apprendre. Même les enfants sont des scientifiques naturels. Ils explorent, ils découvrent, ils comprennent." \
  --write-media public/audio/science_curiosity_1.mp3

echo "✓ All audio files generated!"
```

Run it:

```bash
chmod +x scripts/quick-tts.sh
./scripts/quick-tts.sh
```

**Or Windows PowerShell:**

```powershell
pip install edge-tts

edge-tts --voice fr-FR-DeniseNeural `
  --text "Bonjour. Aujourd'hui, nous allons parler de la philosophie..." `
  --write-media public/audio/philosophy_intro_1.mp3

# Repeat for other 2 files
```

---

## Cost Comparison

| Service            | Free Tier   | Quality   | Setup Time | Best For    |
| ------------------ | ----------- | --------- | ---------- | ----------- |
| **Edge TTS**       | Unlimited   | Good      | 1 min      | Quick start |
| **Google Cloud**   | 1M chars/mo | Excellent | 10 min     | Production  |
| **Azure TTS**      | 5M chars/mo | Excellent | 10 min     | High volume |
| **Web Speech API** | Unlimited   | Varies    | 5 min      | Fallback    |
| **Coqui TTS**      | Unlimited   | Good      | 30 min     | Self-hosted |

---

## Next Steps

1. **Right now**: Use Edge TTS to generate your 3 audio files (5 minutes)
2. **This week**: Set up Google Cloud TTS for production-quality voices
3. **Before launch**: Add Web Speech API as fallback in AudioPlayer component

All three options are completely free for your use case! 🎉
