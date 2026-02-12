# Audio Files Directory

Place your French audio content files here.

## Required Files for Mock Content

The current mock content expects these files:

- `philosophy_intro_1.mp3` (75 seconds)
- `fitness_basics_1.mp3` (68 seconds)
- `science_curiosity_1.mp3` (82 seconds)

## Creating Audio Files

### Option 1: Text-to-Speech Services

**Google Cloud TTS** (Free tier: 1M chars/month)

```bash
# Install gcloud CLI
gcloud auth login
# Generate audio
gcloud tts synthesize-speech --text="..." --output=philosophy_intro_1.mp3 --voice=fr-FR-Neural2-A
```

**ElevenLabs** (High quality, $5/month)

- Web interface: elevenlabs.io
- Select French voice
- Paste transcript
- Download MP3

**OpenAI TTS** (Pay per use)

```bash
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "voice": "alloy",
    "input": "Bonjour..."
  }' \
  --output philosophy_intro_1.mp3
```

### Option 2: Record Your Own

If you speak French or have access to a native speaker:

1. Use Audacity (free) or any audio recorder
2. Record the transcripts from `src/lib/content/engine.ts`
3. Export as MP3
4. Place files here

### Option 3: Download Free Resources

**Forvo** (forvo.com)

- Native speaker recordings
- Free for personal use

**LibriVox** (librivox.org)

- Public domain French audiobooks
- Extract short segments

## File Naming Convention

For production content:

```
[topic]_[subtopic]_[level]_[number].mp3

Examples:
philosophy_stoicism_a1_001.mp3
fitness_nutrition_b1_007.mp3
science_physics_a2_003.mp3
```

## Audio Specifications

**Recommended:**

- Format: MP3
- Bitrate: 128kbps (good quality, reasonable file size)
- Sample rate: 44.1kHz
- Mono (language learning doesn't need stereo)

**File size estimates:**

- 60 seconds @ 128kbps ≈ 1MB
- 90 seconds @ 128kbps ≈ 1.5MB

## Storage Considerations

### Development (Local)

Store files in this directory (`/public/audio/`)

### Production (Supabase Storage)

1. Upload to Supabase Storage bucket: `audio`
2. Get public URL
3. Update `audio_url` in `content_segments` table
4. Remove from `/public/` to save deployment size

### Production (CDN)

For scale:

1. Upload to CloudFlare R2 (cheap object storage)
2. Set up CDN
3. Store URLs in database
4. Benefit: Faster delivery, lower costs

## Current Mock Transcripts

### Philosophy (75 seconds)

```
Bonjour. Aujourd'hui, nous allons parler de la philosophie.
La philosophie est l'amour de la sagesse. C'est une manière
de penser sur le monde, sur nous-mêmes, et sur la vie.
Beaucoup de gens pensent que la philosophie est difficile,
mais ce n'est pas vrai. La philosophie commence avec une
simple question : Pourquoi ?
```

### Fitness (68 seconds)

```
Le corps humain est magnifique. Pour rester en bonne santé,
nous devons bouger chaque jour. Marcher est simple et très
bon pour le cœur. Courir développe la force. Respirer
profondément calme l'esprit. Votre corps vous remercie
quand vous prenez soin de lui.
```

### Science (82 seconds)

```
La science est une aventure. C'est observer le monde avec
curiosité. Un scientifique pose des questions. Il fait des
expériences pour trouver des réponses. La méthode scientifique
est simple : observer, questionner, tester, apprendre. Même
les enfants sont des scientifiques naturels. Ils explorent,
ils découvrent, ils comprennent.
```

## Testing Without Audio

The app will work without audio files (player shows error), but to fully test:

1. Create placeholder audio files
2. OR use any French audio as temporary test files
3. Rename to match expected filenames

## Next Steps

Once you have audio files:

1. Place them in this directory
2. Refresh the app
3. Navigate to `/learn/session`
4. Test the complete audio player functionality
