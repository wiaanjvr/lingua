import {
  ContentSegment,
  ComprehensionQuestion,
  ProficiencyLevel,
} from "@/types";

// API-based content fetching for dynamic loading
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchSegments(
  options: {
    level?: ProficiencyLevel;
    topic?: string;
    page?: number;
    limit?: number;
    excludeIds?: string[];
  } = {},
) {
  const params = new URLSearchParams();

  if (options.level) params.set("level", options.level);
  if (options.topic) params.set("topic", options.topic);
  if (options.page) params.set("page", options.page.toString());
  if (options.limit) params.set("limit", options.limit.toString());
  if (options.excludeIds?.length)
    params.set("exclude", options.excludeIds.join(","));

  const response = await fetch(`${API_BASE}/api/segments?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch segments");
  }

  return response.json();
}

export async function fetchSegmentById(id: string): Promise<ContentSegment> {
  const response = await fetch(`${API_BASE}/api/segments/${id}`);

  if (!response.ok) {
    throw new Error("Segment not found");
  }

  return response.json();
}

export async function fetchVocabularyExercises(segmentId: string) {
  const response = await fetch(`${API_BASE}/api/vocabulary/${segmentId}`);

  if (!response.ok) {
    throw new Error("Vocabulary not found");
  }

  return response.json();
}

// Backwards compatible functions for existing code (now using API)
export async function getSegmentsByLevel(
  level: ProficiencyLevel,
): Promise<ContentSegment[]> {
  const data = await fetchSegments({ level, limit: 100 });
  return data.segments;
}

export async function getSegmentsByTopic(
  topic: string,
): Promise<ContentSegment[]> {
  const data = await fetchSegments({ topic, limit: 100 });
  return data.segments;
}

export async function getSegmentById(
  id: string,
): Promise<ContentSegment | undefined> {
  try {
    return await fetchSegmentById(id);
  } catch {
    return undefined;
  }
}

export async function getVocabularyExercises(
  segmentId: string,
): Promise<any[]> {
  try {
    return await fetchVocabularyExercises(segmentId);
  } catch {
    return [];
  }
}

export async function selectNextSegment(
  userLevel: ProficiencyLevel,
  userInterests: string[],
  completedSegments: string[],
): Promise<ContentSegment | null> {
  // Try to find segments matching user interests first
  for (const topic of userInterests) {
    const data = await fetchSegments({
      level: userLevel,
      topic,
      excludeIds: completedSegments,
      limit: 1,
    });

    if (data.segments.length > 0) {
      return data.segments[0];
    }
  }

  // Fallback to any segment at user level
  const data = await fetchSegments({
    level: userLevel,
    excludeIds: completedSegments,
    limit: 1,
  });

  return data.segments[0] || null;
}

// Mock questions (kept for backward compatibility - could be moved to API)
export const MOCK_QUESTIONS: Record<string, ComprehensionQuestion[]> = {
  "1": [
    {
      id: "q1_1",
      segment_id: "1",
      question: "What does philosophy mean according to the segment?",
      question_language: "native",
      options: [
        "Love of wisdom",
        "Love of science",
        "Love of questions",
        "Love of difficulty",
      ],
      correct_answer: 0,
    },
    {
      id: "q1_2",
      segment_id: "1",
      question: "How does philosophy begin?",
      question_language: "native",
      options: [
        "With a difficult book",
        "With a simple question",
        "With a teacher",
        "With many years of study",
      ],
      correct_answer: 1,
    },
    {
      id: "q1_3",
      segment_id: "1",
      question: "Qu'est-ce que la philosophie ?",
      question_language: "target",
      options: [
        "L'amour de la sagesse",
        "L'amour de la science",
        "Une chose très difficile",
        "Une matière scolaire",
      ],
      correct_answer: 0,
      explanation: "La philosophie est l'amour de la sagesse (love of wisdom).",
    },
  ],
  "2": [
    {
      id: "q2_1",
      segment_id: "2",
      question: "According to the segment, what should we do every day?",
      question_language: "native",
      options: [
        "Run a marathon",
        "Move/exercise",
        "Go to the gym",
        "Lift weights",
      ],
      correct_answer: 1,
    },
    {
      id: "q2_2",
      segment_id: "2",
      question: "What does deep breathing do?",
      question_language: "native",
      options: [
        "Builds strength",
        "Improves heart health",
        "Calms the mind",
        "Helps you run faster",
      ],
      correct_answer: 2,
    },
    {
      id: "q2_3",
      segment_id: "2",
      question: "Qu'est-ce qui est bon pour le cœur ?",
      question_language: "target",
      options: ["Respirer", "Marcher", "Dormir", "Manger"],
      correct_answer: 1,
      explanation: "Marcher (walking) est très bon pour le cœur (heart).",
    },
  ],
  "3": [
    {
      id: "q3_1",
      segment_id: "3",
      question: "What is the scientific method?",
      question_language: "native",
      options: [
        "Read, memorize, repeat",
        "Observe, question, test, learn",
        "Study, practice, exam",
        "Think, write, publish",
      ],
      correct_answer: 1,
    },
    {
      id: "q3_2",
      segment_id: "3",
      question: "Who are described as natural scientists?",
      question_language: "native",
      options: [
        "Only university professors",
        "People with lab equipment",
        "Even children",
        "Only adults",
      ],
      correct_answer: 2,
    },
    {
      id: "q3_3",
      segment_id: "3",
      question: "Que fait un scientifique ?",
      question_language: "target",
      options: [
        "Il pose des questions",
        "Il regarde la télévision",
        "Il lit seulement",
        "Il travaille seul",
      ],
      correct_answer: 0,
      explanation:
        "Un scientifique pose des questions (asks questions) et fait des expériences.",
    },
  ],
};

// Comprehension questions for segments (kept for backward compatibility)
export function getQuestionsForSegment(
  segmentId: string,
): ComprehensionQuestion[] {
  return MOCK_QUESTIONS[segmentId] || [];
}
