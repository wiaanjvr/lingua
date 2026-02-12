# Placement Test Audio Files

This directory contains the audio files for the placement assessment test.

## Files Needed

- `audio-a1.mp3` - A1 level (Beginner)
- `audio-a2.mp3` - A2 level (Elementary)
- `audio-b1.mp3` - B1 level (Intermediate)
- `audio-b2.mp3` - B2 level (Upper Intermediate)
- `audio-c1.mp3` - C1 level (Advanced)

## Content

| File         | Difficulty | French Text                                                                                                                                              |
| ------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| audio-a1.mp3 | A1         | "Bonjour, je m'appelle Marie. J'ai vingt ans."                                                                                                           |
| audio-a2.mp3 | A2         | "Ce matin, je suis allé au marché pour acheter des fruits et des légumes."                                                                               |
| audio-b1.mp3 | B1         | "Le rapport indique que les ventes ont augmenté de quinze pour cent ce trimestre par rapport à l'année dernière."                                        |
| audio-b2.mp3 | B2         | "Bien que la situation économique soit préoccupante, les experts estiment qu'une reprise progressive est envisageable d'ici la fin de l'année."          |
| audio-c1.mp3 | C1         | "L'émergence des technologies disruptives a fondamentalement bouleversé les paradigmes traditionnels qui régissaient jusqu'alors le secteur industriel." |

## Generating Audio Files

### Option 1: Google Cloud TTS (Recommended)

1. Set up Google Cloud credentials:

   ```bash
   set GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
   ```

2. Run the generation script:
   ```bash
   python scripts/generate_placement_audio.py
   ```

### Option 2: Manual Creation

You can also use any text-to-speech tool (e.g., ElevenLabs, Amazon Polly, or macOS say command) to create the audio files manually using the text content above.

### Option 3: Record Yourself

For development/testing, you can record yourself reading the text snippets.

## Duration

Each audio clip should be approximately 8-12 seconds in duration.
