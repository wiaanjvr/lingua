# Speech Validation System

## Overview

The Foundation Lessons now include **real-time speech validation** using the Web Speech API. Students must correctly pronounce phrases to pass each lesson, ensuring proper learning outcomes.

## How It Works

### 1. Speech Recognition

- Uses **Web Speech API** (built into modern browsers)
- Recognizes French speech (`fr-FR` language code)
- Auto-stops after 5 seconds of recording
- Works in Chrome, Edge, and Safari

### 2. Validation Algorithm

#### Text Normalization

Both spoken and expected text are normalized:

- Convert to lowercase
- Remove accents (é → e, à → a)
- Remove punctuation
- Trim whitespace

#### Similarity Calculation

Uses **Levenshtein Distance** algorithm to calculate similarity:

- Measures minimum edits needed to transform one string to another
- Converts to percentage score (0-100%)
- **Passing threshold: 75%**

#### Feedback Levels

| Similarity | Feedback                                                      | Pass?  |
| ---------- | ------------------------------------------------------------- | ------ |
| 95-100%    | "Perfect! You nailed it! 🎉"                                  | ✅ Yes |
| 85-94%     | "Excellent! Very close! ✨"                                   | ✅ Yes |
| 75-84%     | "Good attempt! Try again for better pronunciation. 👍"        | ✅ Yes |
| 60-74%     | "Not quite right. Listen carefully and try again. 🎧"         | ❌ No  |
| 40-59%     | "That's quite different. Take your time and listen again. 🔄" | ❌ No  |
| 0-39%      | "I didn't catch that. Try speaking more clearly. 🎤"          | ❌ No  |

### 3. User Experience

**Recording Flow:**

1. Click "Record Yourself" button
2. Speak the phrase clearly (you have 5 seconds)
3. Get instant feedback with:
   - Transcript of what you said
   - Accuracy percentage
   - Pass/fail status
   - Attempt counter

**If Failed:**

- "Try Again" button appears
- Can retry unlimited times
- No penalty for multiple attempts

**If Passed:**

- Green success message
- "Continue" button becomes enabled
- Can move to next lesson

### 4. Browser Compatibility

| Browser | Supported | Notes                        |
| ------- | --------- | ---------------------------- |
| Chrome  | ✅ Yes    | Full support                 |
| Edge    | ✅ Yes    | Full support                 |
| Safari  | ✅ Yes    | Full support (iOS 14.5+)     |
| Firefox | ❌ No     | Web Speech API not supported |

**Fallback for Unsupported Browsers:**

- Shows warning message
- Provides "Mark as Complete" button
- Allows progression without validation

## Technical Details

### Files Created

1. **`src/lib/speech/useSpeechRecognition.ts`**
   - Custom React hook for Web Speech API
   - Handles browser compatibility
   - Manages recording state and errors

2. **`src/lib/speech/validation.ts`**
   - Text normalization utilities
   - Levenshtein distance algorithm
   - Similarity calculation
   - Validation logic

### Updated Components

1. **`FoundationPhraseTeacher.tsx`**
   - Added speech recognition
   - Show transcript and validation results
   - Require 75% accuracy to pass

2. **`SingleSentenceLesson.tsx`**
   - Added speech recognition
   - Show transcript and validation results
   - Require 75% accuracy to pass

## Configuration

### Adjusting Difficulty

**Change passing threshold:**

```typescript
// In FoundationPhraseTeacher.tsx or SingleSentenceLesson.tsx
const result = validateSpeechInput(transcript, phrase.phrase_french, 75);
//                                                                   ^^^ Change this number (0-100)
```

**Recommendations:**

- **75% (current)**: Balanced - catches major errors but forgiving of accents
- **85%**: Strict - requires very accurate pronunciation
- **65%**: Lenient - allows more variation

### Recording Duration

**Change auto-stop timeout:**

```typescript
// In both components, in the useEffect
setTimeout(() => {
  stopListening();
}, 5000); // Change this number (milliseconds)
```

## User Privacy

- **No audio is uploaded or stored**
- Speech recognition happens **locally in the browser**
- Transcripts are stored only in component state (cleared on unmount)
- No external API calls required

## Troubleshooting

### "Speech recognition not supported"

- User is on Firefox or older browser
- Switch to Chrome, Edge, or Safari
- Fallback: "Mark as Complete" button

### "Please check your microphone permissions"

- Browser blocked microphone access
- Check browser settings
- Look for microphone icon in address bar
- Grant permission when prompted

### Low accuracy scores despite correct pronunciation

- Background noise affecting recognition
- Microphone quality issues
- Speaking too fast or too slow
- Solution: Reduce threshold or improve audio environment

### Recognition not detecting French

- Language set to `fr-FR` in hook
- Should auto-detect French speech
- If issues persist, check browser language settings

## Future Enhancements

Potential improvements:

- [ ] Show phonetic breakdown during validation
- [ ] Highlight which words were incorrect
- [ ] Slow-motion audio playback
- [ ] Record user's audio for playback comparison
- [ ] Adaptive difficulty based on user performance
- [ ] Progress analytics (average accuracy, attempts per lesson)
- [ ] Alternative: Whisper API for better accuracy (requires backend)

## Performance

- **Lightweight**: No external dependencies
- **Fast**: Instant validation (< 100ms)
- **Offline capable**: Works without internet (after page load)
- **Battery friendly**: No continuous recording, only on-demand

## License

Same as parent Lingua 2.0 project.
