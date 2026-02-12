# Development Guide

## Project Structure

```
lingua_2.0/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with fonts
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/              # Authentication pages
│   │   ├── onboarding/        # User onboarding flow
│   │   ├── dashboard/         # Main dashboard
│   │   ├── learn/session/     # Learning session interface
│   │   └── settings/          # User settings
│   ├── components/
│   │   ├── ui/                # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── progress.tsx
│   │   └── learning/          # Learning-specific components
│   │       ├── AudioPlayer.tsx
│   │       ├── QuestionCard.tsx
│   │       └── SpeakingRecorder.tsx
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   ├── supabase/          # Database client
│   │   ├── content/           # Content engine logic
│   │   └── store/             # Zustand state management
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global CSS
├── supabase/                  # Database schema and migrations
└── public/                    # Static assets (audio files, etc.)
```

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Key Features

### 1. Landing Page (`/`)

- Marketing content explaining the learning philosophy
- Feature highlights
- Pricing information
- CTA to sign up

### 2. Authentication (`/auth`)

- Sign up: `/auth/signup`
- Sign in: `/auth/login`
- Currently mocked, ready for Supabase integration

### 3. Onboarding (`/onboarding`)

- **Step 1**: Select proficiency level (A1-B2)
- **Step 2**: Choose interests (minimum 3)
- Stores preferences for content personalization

### 4. Dashboard (`/dashboard`)

- Daily session status (free: 1/day, premium: unlimited)
- Learning statistics
- Progress visualization
- Quick access to start session

### 5. Learning Session (`/learn/session`)

Complete learning flow with 4 phases:

**Phase 1: Listening (15%)**

- Audio player with playback controls
- Optional transcript reveal
- Optional translation reveal
- Tracks listen count

**Phase 2: Comprehension (50%)**

- Multiple choice questions
- Mix of native language and target language questions
- Immediate feedback with explanations
- Tracks correct answers

**Phase 3: Speaking (80%)**

- Record audio response
- Prompt to describe understanding
- Stores recording for future analysis

**Phase 4: Complete (100%)**

- Session summary
- Comprehension score
- Vocabulary absorbed
- Return to dashboard

### 6. Settings (`/settings`)

- Subscription management
- Interest customization
- Profile information
- Account actions

## State Management

Using **Zustand** for global state:

```typescript
const { user, setUser } = useAppStore();
const { currentSession, setCurrentSession } = useAppStore();
```

Current stores:

- User profile
- Current learning session
- Session active state

## Content Engine

Located in `src/lib/content/engine.ts`:

- `selectNextSegment()`: Chooses next content based on level, interests, and history
- `getSegmentsByLevel()`: Filters content by proficiency
- `getSegmentsByTopic()`: Filters by interest topic
- `getQuestionsForSegment()`: Retrieves comprehension questions

Currently uses mock data. Ready to be replaced with Supabase queries.

## Audio System

### AudioPlayer Component

- Play/pause/restart controls
- Progress bar with time display
- Optional transcript display
- Callback on playback complete

### SpeakingRecorder Component

- Native Web Audio API
- Records WebM audio
- Playback preview
- Delete and re-record functionality
- Returns Blob for upload

## Styling

### Design System

- **Colors**: HSL-based color system with light/dark mode support
- **Typography**: Inter (sans-serif) + Lora (serif for content)
- **Spacing**: Tailwind's default spacing scale
- **Components**: Radix UI primitives + custom styling

### Tailwind Configuration

Custom theme in `tailwind.config.ts`:

- CSS custom properties for theming
- Extended color palette
- Custom font families

## Data Flow

### Current (MVP - Mock Data)

```
Component → lib/content/engine.ts (mock) → Component renders
```

### Future (With Supabase)

```
Component → Supabase query → Database → Component renders
Component → API route → External service → Database → Component
```

## Adding New Content

For MVP, edit `src/lib/content/engine.ts`:

1. Add to `MOCK_SEGMENTS` array
2. Add questions to `MOCK_QUESTIONS` object
3. Place audio file in `/public/audio/`

For production with Supabase:

1. Upload audio to Supabase Storage
2. Insert into `content_segments` table
3. Insert questions into `comprehension_questions` table

## Pedagogy Implementation

### Comprehensible Input

- Content tagged by CEFR level (A1-C2)
- Audio + optional text support
- Translation available but not default

### Spaced Repetition

- `user_progress` table tracks encounters
- Algorithm selects unseen or "due" content
- Natural re-encounter, not card-based

### Interest Alignment

- Content tagged by topic
- User selects 3-5 interests
- Content engine prioritizes matches

### Listening-First

- Audio plays before text appears
- Multiple listens encouraged
- Comprehension tested on meaning, not words

### Speaking Practice

- Open-ended prompts (not drilling)
- Focus on expression, not perfection
- Recording for self-reflection

## Next Development Steps

1. **Supabase Integration**
   - Replace mock auth with real Supabase auth
   - Query real content from database
   - Save user progress

2. **Speech Analysis**
   - Integrate Deepgram or Whisper for transcription
   - Pronunciation scoring (compare phonemes)
   - Fluency metrics (speech rate, hesitations)

3. **Advanced Content Engine**
   - Difficulty calibration based on performance
   - Dynamic comprehensible input level adjustment
   - Pattern re-encounter scheduling

4. **Payments**
   - Stripe integration
   - Subscription management
   - Usage limits enforcement

5. **Analytics Dashboard**
   - Long-term progress charts
   - Vocabulary acquisition graphs
   - Time-to-fluency projections

## Testing Strategy

### Manual Testing Checklist

- [ ] Landing page loads and links work
- [ ] Sign up flow completes
- [ ] Onboarding saves preferences
- [ ] Dashboard displays correctly
- [ ] Learning session plays audio
- [ ] Questions display and score correctly
- [ ] Recording captures audio
- [ ] Session completion saves progress
- [ ] Settings update correctly

### Future: Automated Testing

- Unit tests for content engine logic
- Integration tests for learning flow
- E2E tests with Playwright

## Performance Considerations

### Optimization Applied

- Next.js automatic code splitting
- Image optimization (when images added)
- Font optimization (next/font)
- Server components for static content

### Future Optimizations

- Audio preloading
- Content prefetching
- CDN for audio files (CloudFlare R2)
- Database query optimization (indexes)

## Accessibility

Current features:

- Semantic HTML
- Keyboard navigation support (Radix UI)
- ARIA labels on interactive elements
- Focus visible states

To add:

- Screen reader announcements for progress
- Captions for audio content
- High contrast mode
- Reduced motion support

## Browser Support

Target: Modern browsers (last 2 versions)

- Chrome/Edge ✓
- Firefox ✓
- Safari ✓

Web Audio API required for recording.
