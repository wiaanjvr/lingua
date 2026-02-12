# Spaced Repetition System (SRS) Integration

## Overview

This implementation combines **comprehensible input** methodology with **spaced repetition** to create an optimal language learning experience. Instead of traditional flashcards or random reading material, the system generates personalized stories that:

- Use 95% words the learner already knows
- Introduce 5% new or review vocabulary
- Prioritize words due for review based on spaced repetition algorithms
- Provide interactive word rating for continuous progress tracking

## Key Features

### 1. **Word-Level Tracking**

Every word a user encounters is tracked in the database with:

- Learning status (new, learning, known, mastered)
- Spaced repetition parameters (easiness factor, interval, next review date)
- Historical performance data

### 2. **SM-2 Algorithm**

Uses the proven SuperMemo SM-2 algorithm for optimal review scheduling:

- Adapts to individual learning pace
- Increases intervals for well-known words
- Decreases intervals for difficult words
- Prevents premature advancement and forgetting

### 3. **Comprehensible Input Stories**

AI-generated stories that:

- Match user's proficiency level (A0-C2)
- Use only vocabulary from user's known words + strategic new words
- Provide natural, engaging context
- Follow the 95%+ comprehension threshold for optimal learning

### 4. **Interactive Learning Flow**

Three-phase approach:

1. **Listen** - Audio-first comprehension
2. **Read** - Visual reinforcement with highlighted new words
3. **Interact** - Rate knowledge of each word

## Database Schema

### `user_words`

Tracks individual word knowledge and SRS parameters.

**Key fields:**

- `easiness_factor`: SM-2 easiness (1.3 to 2.5+)
- `repetitions`: Number of successful reviews
- `interval_days`: Days until next review
- `next_review`: Timestamp for next review
- `status`: Learning state (new, learning, known, mastered)

### `word_interactions`

Records each word rating event for analytics and progress tracking.

### `generated_stories`

Stores AI-generated comprehensible input stories with metadata about word composition.

### `story_progress`

Tracks user's progress through each story.

## Setup Instructions

### 1. Database Migration

Run the migration to add SRS tables:

```bash
cd lingua_2.0
# Copy the migration file to Supabase
# Then run:
supabase db push
```

Or apply directly in Supabase dashboard by executing:
[supabase/migrations/add_word_tracking_srs.sql](supabase/migrations/add_word_tracking_srs.sql)

### 2. Environment Variables

Add to your `.env.local`:

```env
# OpenAI API for story generation
OPENAI_API_KEY=sk-your-key-here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 3. Install Dependencies

No new dependencies needed - uses existing Next.js and Supabase setup.

### 4. Access the New Learning System

Navigate to: **`/learn/srs`**

This is a new route that runs alongside the existing `/learn` page.

## How It Works

### Word Selection Algorithm

1. **Fetch user's vocabulary** from `user_words` table
2. **Identify review words** - words whose `next_review` date has passed
3. **Calculate target counts**:
   - Total words = based on proficiency level (A0: 50, A1: 75, B1: 150, etc.)
   - New words = 5% of total (adjustable by level)
   - Known words = 95% of total
4. **Prioritize review words** - 40% of known words should be due for review
5. **Fill remaining slots** with random known words for variety

### Story Generation

1. **Generate vocabulary list** using word selection algorithm
2. **Create AI prompt** with vocabulary constraints
3. **Call OpenAI API** (GPT-4) to generate story
4. **Validate output** - ensure new words appear and word count is appropriate
5. **Store in database** with metadata

### SRS Update on Word Rating

When user rates a word (0-5 scale):

```
Rating Scale:
0 = Total blackout - no idea
1 = Wrong - incorrect guess
2 = Hard - correct but difficult
3 = Good - correct with hesitation
4 = Easy - immediate recall
5 = Perfect - mastered
```

**Algorithm (SM-2):**

1. Update **easiness factor** based on performance
2. Adjust **repetition count** (reset if failed)
3. Calculate **new interval**:
   - Failed (0-1): Review in ~2.4 hours
   - First success: 1 day
   - Second success: 6 days
   - Further: Previous interval × easiness factor
4. Set **next review date**
5. Update **status** based on performance history

## User Experience Flow

### First Time User

1. No vocabulary tracked yet
2. Generate first story → introduces most common French words
3. Listen to story
4. Read and identify new words (highlighted)
5. Rate each word
6. System builds initial vocabulary profile

### Returning User

1. Dashboard shows:
   - Total vocabulary count
   - Words by status (learning, known, mastered)
   - Words due for review today
2. Click "Generate New Story"
3. Story prioritizes review words + introduces strategic new vocabulary
4. Complete 3-phase learning flow
5. Progress automatically tracked

### Long-Term Use

- Vocabulary grows systematically
- Review intervals optimize to user's pace
- Stories remain comprehensible (95%+ known words)
- Natural progression through proficiency levels

## API Endpoints

### `GET /api/words`

Get user's vocabulary words.

**Query params:**

- `language` - filter by language (default: fr)
- `status` - filter by status (new, learning, known, mastered)
- `due` - only words due for review (true/false)

### `POST /api/words/rate`

Rate a word and update SRS parameters.

**Body:**

```json
{
  "word": "philosophie",
  "lemma": "philosophie",
  "rating": 3,
  "language": "fr",
  "story_id": "uuid",
  "context_sentence": "La philosophie est fascinante."
}
```

### `GET /api/words/stats`

Get vocabulary statistics.

**Returns:**

```json
{
  "stats": {
    "total": 150,
    "new": 10,
    "learning": 50,
    "known": 70,
    "mastered": 20,
    "dueForReview": 25,
    "percentageKnown": 60.0
  }
}
```

### `POST /api/stories/generate`

Generate a new comprehensible input story.

**Body:**

```json
{
  "language": "fr",
  "level": "A2",
  "topic": "science",
  "word_count_target": 100,
  "new_word_percentage": 0.05,
  "prioritize_review": true
}
```

### `GET /api/stories/generate`

Get user's generated stories.

**Query params:**

- `completed` - filter by completion status (true/false)
- `limit` - max results (default: 10)

## Components

### `<InteractiveStory>`

Main learning interface with three phases (listen, read, interact).

**Props:**

- `story: GeneratedStory`
- `onComplete: () => void`
- `onWordRated: (word: string, rating: WordRating) => Promise<void>`

### `<WordRatingPopover>`

Modal for rating word knowledge on 0-5 scale.

**Props:**

- `word: string`
- `onRate: (rating: WordRating) => void`
- `onClose: () => void`

## Algorithm Utilities

### `src/lib/srs/algorithm.ts`

Core SM-2 implementation:

- `calculateNextReview()` - Compute next review date
- `getWordPriority()` - Calculate inclusion priority
- `selectWordsForStory()` - Choose words for story
- `getVocabularyStats()` - Compute statistics

### `src/lib/srs/story-generator.ts`

Story generation logic:

- `selectWordsForGeneration()` - Build word list
- `generateStoryPrompt()` - Create AI prompt
- `validateGeneratedStory()` - Quality check
- `parseStoryWords()` - Tokenize for interaction

## Future Enhancements

### Short Term

- [ ] Add audio generation for stories (TTS)
- [ ] Support multiple languages beyond French
- [ ] Add topic preferences and interests
- [ ] Export vocabulary lists
- [ ] Progress charts and analytics

### Medium Term

- [ ] Adaptive difficulty based on performance
- [ ] Cloze deletion exercises within stories
- [ ] Speaking practice integration
- [ ] Mobile app version
- [ ] Offline mode support

### Long Term

- [ ] Community-generated content
- [ ] Multi-user challenges and leaderboards
- [ ] Advanced NLP for better word lemmatization
- [ ] Integration with external dictionaries
- [ ] Video content with comprehensible input

## Troubleshooting

### Stories not generating

- Check `OPENAI_API_KEY` is set in `.env.local`
- Verify OpenAI API quota/billing
- Check browser console and server logs for errors

### Words not saving

- Verify database migration ran successfully
- Check Supabase RLS policies are active
- Ensure user is authenticated

### Inaccurate word highlighting

- Current implementation uses simple tokenization
- Consider integrating French NLP library (e.g., spaCy)
- Manually curate lemma mappings for better accuracy

## References

- **SM-2 Algorithm**: [SuperMemo Documentation](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- **Comprehensible Input**: Stephen Krashen's Input Hypothesis
- **Optimal Comprehension**: 95%+ known words for language acquisition

## License

Part of the Lingua language learning platform.
