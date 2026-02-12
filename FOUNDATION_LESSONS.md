# Foundation Lessons System

A progressive language learning system designed for absolute beginners (A0 level) who need to start with essential survival phrases before advancing to full sentences and passages.

## 📚 Overview

The Foundation Lessons system introduces a **three-phase progressive learning path**:

1. **Foundation Phrases (A0)** - Essential survival communication
   - "I understand" / "I don't understand"
   - "Can you repeat?" / "Speak more slowly"
   - Core meta-communication phrases

2. **Single Sentences (A0-A1)** - Basic conversational sentences
   - Greetings and introductions
   - Simple questions and responses
   - Everyday polite phrases

3. **Full Passages (A1+)** - Existing 30-second audio segments
   - Natural speech comprehension
   - Complex vocabulary
   - Real-world scenarios

## 🎯 Key Features

- **Progressive Structure**: Start with 2-3 word phrases before full sentences
- **Meta-Communication First**: Teach "I understand/don't understand" immediately
- **Forced Listening**: Students must listen minimum 3 times before progressing
- **Recording Requirement**: Students must record themselves speaking
- **Word-by-Word Breakdown**: Phonetic pronunciation guide for each word
- **Interactive Practice**: 6-step teaching flow per phrase

## 🏗️ Implementation

### File Structure

```
lingua_2.0/
├── src/
│   ├── data/
│   │   └── foundation-lessons.json          # 12 progressive lessons (4 foundation + 8 sentences)
│   ├── types/
│   │   └── index.ts                         # Added A0 level & foundation types
│   ├── components/learning/
│   │   ├── FoundationPhraseTeacher.tsx      # Interactive foundation phrase component
│   │   └── SingleSentenceLesson.tsx         # Interactive sentence lesson component
│   ├── app/
│   │   ├── learn/
│   │   │   └── page.tsx                     # Main progressive learning session page
│   │   ├── dashboard/
│   │   │   └── page.tsx                     # Updated to link to /learn
│   │   └── api/foundation/
│   │       └── route.ts                     # API endpoint for foundation lessons
├── supabase/
│   ├── schema.sql                           # Updated with A0 level support
│   └── migrations/
│       └── add_a0_level.sql                 # Migration to add A0 level
├── scripts/
│   └── generate_foundation_audio.py         # Python script to generate MP3 audio files
└── public/audio/
    ├── foundation/                          # Foundation phrase MP3 files
    └── single/                              # Single sentence MP3 files
```

### Database Changes

The PostgreSQL schema now supports **A0 (absolute beginner)** level:

```sql
-- Updated check constraint
proficiency_level TEXT CHECK (proficiency_level IN ('A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'))

-- Default level is now A0 for new users
DEFAULT 'A0'
```

### Learning Flow

```
User starts → Check proficiency level
                ↓
           [A0 Level?]
                ↓
        ┌──────YES─────┐
        ↓               ↓
   Foundation       A1+ Level?
   Phrases (4)          ↓
        ↓           Single Sentences
   Single              (8)
   Sentences (8)        ↓
        ↓           Full Passages
   Full Passages    (Existing)
   (Existing)
```

## 🚀 Setup Instructions

### 1. Database Migration

Run the migration to add A0 level support:

```bash
# Open Supabase dashboard → SQL Editor
# Copy and paste the contents of supabase/migrations/add_a0_level.sql
# Run the migration
```

Or using Supabase CLI:

```bash
cd lingua_2.0
supabase db push
```

### 2. Generate Audio Files

Install required Python package:

```bash
pip install edge-tts
```

Generate MP3 audio files for all foundation lessons:

```bash
cd lingua_2.0
python scripts/generate_foundation_audio.py
```

This will create:

- `public/audio/foundation/*.mp3` - Foundation phrase audio (4 lessons × 2 variations = ~8 files)
- `public/audio/single/*.mp3` - Single sentence audio (8 lessons × responses = ~24 files)

**Voice Used**: `fr-FR-DeniseNeural` (Female, natural, clear pronunciation)

### 3. Update User Profiles (Optional)

To reset existing users to A0 level:

```sql
-- In Supabase SQL Editor
UPDATE profiles
SET proficiency_level = 'A0'
WHERE proficiency_level IS NULL OR proficiency_level = 'A1';
```

### 4. Test the Learning Flow

1. Login to your app
2. Go to Dashboard → Click "Start Learning"
3. You should see Foundation Phrases first (if A0 level)
4. Complete all 4 foundation phrases
5. Progress to Single Sentences (8 lessons)
6. Finally access Full Passages (existing system)

## 📖 Lesson Content

### Foundation Phrases (Phase 1)

| Order | French                | English            | Use Case                 |
| ----- | --------------------- | ------------------ | ------------------------ |
| 1     | Je comprends          | I understand       | Confirming comprehension |
| 2     | Je ne comprends pas   | I don't understand | Asking for help          |
| 3     | Pouvez-vous répéter ? | Can you repeat?    | Requesting repetition    |
| 4     | Parlez plus lentement | Speak more slowly  | Requesting slower speech |

### Single Sentences (Phase 2)

| Order | French                               | English                       | Topic             |
| ----- | ------------------------------------ | ----------------------------- | ----------------- |
| 5     | Bonjour, comment allez-vous ?        | Hello, how are you?           | Greetings         |
| 6     | Je m'appelle [name]                  | My name is [name]             | Introduction      |
| 7     | Où sont les toilettes ?              | Where are the toilets?        | Asking directions |
| 8     | Combien ça coûte ?                   | How much does it cost?        | Shopping          |
| 9     | Je voudrais un café, s'il vous plaît | I would like a coffee, please | Ordering          |
| 10    | Merci beaucoup                       | Thank you very much           | Gratitude         |
| 11    | Parlez-vous anglais ?                | Do you speak English?         | Language help     |
| 12    | Au revoir                            | Goodbye                       | Farewell          |

## 🎨 Component Features

### FoundationPhraseTeacher

6-step interactive learning process:

1. **Intro** - Show phrase with translation
2. **Listen** - Force minimum 3x listening
3. **Breakdown** - Word-by-word pronunciation
4. **Context** - Usage examples and scenarios
5. **Speak** - Record yourself (required)
6. **Complete** - Celebration and summary

### SingleSentenceLesson

5-step interactive learning process:

1. **Listen** - Sentence audio with translation
2. **Vocabulary** - Key words breakdown
3. **Respond** - Common response options
4. **Speak** - Practice speaking (required)
5. **Complete** - Review and celebration

## 🔧 Customization

### Adding New Lessons

Edit `src/data/foundation-lessons.json`:

```json
{
  "id": 13,
  "order": 13,
  "level": "A0",
  "phase": "sentences",
  "topic": "your-topic",
  "sentence_french": "Your French sentence",
  "sentence_english": "Your English translation",
  "phonetic": "phonetic pronunciation",
  "audio_url": "/audio/single/your_audio.mp3",
  "key_vocabulary": [{ "word": "mot", "meaning": "word" }],
  "response_options": [
    {
      "french": "Response",
      "english": "Translation",
      "audio_url": "/audio/single/response.mp3"
    }
  ]
}
```

Then regenerate audio:

```bash
python scripts/generate_foundation_audio.py
```

### Changing Voice

Edit `scripts/generate_foundation_audio.py`:

```python
# Available French voices:
# fr-FR-DeniseNeural (Female, warm)
# fr-FR-HenriNeural (Male, professional)
# fr-FR-BrigitteNeural (Female, friendly)

VOICE = "fr-FR-HenriNeural"  # Change here
```

## 📊 Progress Tracking

User progress is automatically tracked:

- Current phase (foundation/sentences/passages)
- Completed lessons count
- Progress percentage
- Phase transitions saved to profile

## 🎯 Next Steps

1. ✅ Foundation lesson data structure created
2. ✅ Interactive teaching components built
3. ✅ Progressive session page implemented
4. ✅ Database schema updated
5. ⏳ **Generate audio files** (Run the Python script)
6. ⏳ **Test the complete flow** (A0 → A1 → passages)
7. ⏳ Update user onboarding to set A0 as default
8. ⏳ Add analytics for phase completion rates

## 🐛 Troubleshooting

**Audio files not playing?**

- Check `public/audio/foundation/` and `public/audio/single/` exist
- Verify MP3 files were generated correctly
- Check browser console for 404 errors

**Users not seeing foundation lessons?**

- Verify proficiency_level is 'A0' in profiles table
- Check migration was applied successfully
- Clear browser cache and reload

**Edge TTS not working?**

- Install: `pip install edge-tts`
- Check internet connection (edge-tts requires online access)
- Try running with `python -m edge_tts.list_voices` to verify setup

## 📝 License

Same as parent Lingua 2.0 project.
