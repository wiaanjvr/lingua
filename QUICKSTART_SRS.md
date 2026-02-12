# Quick Start - SRS System

## Immediate Setup (5 minutes)

### 1. Run Database Migration

```bash
# Option A: Using Supabase CLI
cd lingua_2.0
supabase db push

# Option B: Manual (Supabase Dashboard)
# 1. Go to your Supabase project
# 2. Navigate to SQL Editor
# 3. Copy contents of: supabase/migrations/add_word_tracking_srs.sql
# 4. Execute the SQL
```

### 2. Add OpenAI API Key (OPTIONAL)

**Note**: The system works with mock stories by default! No API key needed to test.

If you want AI-generated custom stories, edit `.env.local`:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your key from: https://platform.openai.com/api-keys

**For testing**: Skip this step and use the built-in mock story!

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test the System

Navigate to: **http://localhost:3000/learn**

(Note: The SRS system is now the default `/learn` page, not `/learn/srs`)

## Testing Checklist

### First User Flow

- [ ] Page loads successfully
- [ ] See vocabulary stats (should show 0 total words)
- [ ] Click "Generate New Story"
- [ ] Story generates (may take 10-30 seconds)
- [ ] Audio player appears in "Listen" phase
- [ ] Click "Continue to reading"
- [ ] New words are highlighted in yellow
- [ ] Click "Continue to practice"
- [ ] Click on highlighted words
- [ ] Rating popup appears
- [ ] Rate word (0-5)
- [ ] Word turns green after rating
- [ ] After all words rated, completion screen appears

### Returning User Flow

- [ ] Vocabulary stats show your words
- [ ] Words have different statuses (learning, known, etc.)
- [ ] "Due for Review" count updates
- [ ] Generate new story
- [ ] Story includes previously seen words
- [ ] Review words highlighted differently (orange)

## Quick Customization

### Adjust New Word Percentage

Edit [src/lib/srs/story-generator.ts](src/lib/srs/story-generator.ts):

```typescript
export function getRecommendedNewWordPercentage(
  level: ProficiencyLevel,
): number {
  const percentages: Record<ProficiencyLevel, number> = {
    A0: 0.15, // Changed from 0.1 to 15% for more challenge
    A1: 0.08,
    A2: 0.05,
    // ... rest
  };
}
```

### Change Story Length

Edit the same file:

```typescript
export function getRecommendedWordCount(level: ProficiencyLevel): number {
  const wordCounts: Record<ProficiencyLevel, number> = {
    A0: 75, // Changed from 50 to 75 words
    A1: 100,
    // ... rest
  };
}
```

### Modify SRS Intervals

Edit [src/lib/srs/algorithm.ts](src/lib/srs/algorithm.ts):

```typescript
// Initial intervals (in days)
const FIRST_INTERVAL = 1; // Change to 0.5 for faster review
const SECOND_INTERVAL = 6; // Change to 3 for faster progression
```

## Common Issues

### "Story generation service not configured"

**Fix**: Add `OPENAI_API_KEY` to `.env.local` and restart dev server

### "Unauthorized" errors

**Fix**: Make sure you're logged in at `/auth/login`

### Stories too easy/hard

**Fix**: Adjust `new_word_percentage` or check your proficiency level in profile

### Database errors

**Fix**: Run migration again, check Supabase connection

## Demo Mode (No OpenAI Key)

If you want to test without OpenAI:

1. Create a mock story in [src/app/api/stories/generate/route.ts](src/app/api/stories/generate/route.ts)

Replace the OpenAI call with:

```typescript
// Mock story for testing
const storyContent = `La philosophie est fascinante. 
C'est l'étude de la sagesse et de la connaissance. 
Les philosophes posent des questions importantes sur la vie et le monde.`;
```

## Next Steps

1. ✅ Set up database
2. ✅ ~~Add API key~~ (Optional - mock story works!)
3. ✅ Test basic flow at `/learn`
4. 📖 Read [SRS_IMPLEMENTATION.md](SRS_IMPLEMENTATION.md) for details
5. 📖 Check [RECENT_FIXES.md](RECENT_FIXES.md) for latest updates
6. 🎨 Customize to your preferences
7. 🚀 Deploy to production

## Support

- Check [SRS_IMPLEMENTATION.md](SRS_IMPLEMENTATION.md) for comprehensive documentation
- Review code comments in:
  - `src/lib/srs/algorithm.ts`
  - `src/lib/srs/story-generator.ts`
  - `src/components/learning/InteractiveStory.tsx`

## Production Deployment

Before deploying:

1. Update Supabase production database with migration
2. Add `OPENAI_API_KEY` to production environment variables
3. Test with a real user account
4. Monitor API costs (OpenAI charges per token)
5. Consider adding rate limiting for story generation

---

**Ready to learn?** Navigate to `/learn/srs` and start your journey! 🚀
