-- Sample data for testing the Lingua app

-- Insert sample content segments
INSERT INTO content_segments (id, language, level, topic, duration_seconds, audio_url, transcript, translations, key_vocabulary, grammar_patterns)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'fr',
    'A1',
    'philosophy',
    75,
    '/audio/philosophy_intro_1.mp3',
    'Bonjour. Aujourd''hui, nous allons parler de la philosophie. La philosophie est l''amour de la sagesse. C''est une manière de penser sur le monde, sur nous-mêmes, et sur la vie. Beaucoup de gens pensent que la philosophie est difficile, mais ce n''est pas vrai. La philosophie commence avec une simple question : Pourquoi ?',
    '{"en": "Hello. Today, we''re going to talk about philosophy. Philosophy is the love of wisdom. It''s a way of thinking about the world, about ourselves, and about life. Many people think philosophy is difficult, but that''s not true. Philosophy starts with a simple question: Why?"}'::jsonb,
    ARRAY['philosophie', 'sagesse', 'penser', 'monde', 'vie', 'question', 'pourquoi'],
    ARRAY['present tense', 'article usage', 'basic negation']
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'fr',
    'A1',
    'fitness',
    68,
    '/audio/fitness_basics_1.mp3',
    'Le corps humain est magnifique. Pour rester en bonne santé, nous devons bouger chaque jour. Marcher est simple et très bon pour le cœur. Courir développe la force. Respirer profondément calme l''esprit. Votre corps vous remercie quand vous prenez soin de lui.',
    '{"en": "The human body is magnificent. To stay healthy, we must move every day. Walking is simple and very good for the heart. Running builds strength. Breathing deeply calms the mind. Your body thanks you when you take care of it."}'::jsonb,
    ARRAY['corps', 'santé', 'bouger', 'marcher', 'courir', 'respirer', 'force'],
    ARRAY['infinitive verbs', 'present tense', 'devoir conjugation']
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'fr',
    'A1',
    'science',
    82,
    '/audio/science_curiosity_1.mp3',
    'La science est une aventure. C''est observer le monde avec curiosité. Un scientifique pose des questions. Il fait des expériences pour trouver des réponses. La méthode scientifique est simple : observer, questionner, tester, apprendre. Même les enfants sont des scientifiques naturels. Ils explorent, ils découvrent, ils comprennent.',
    '{"en": "Science is an adventure. It''s observing the world with curiosity. A scientist asks questions. They conduct experiments to find answers. The scientific method is simple: observe, question, test, learn. Even children are natural scientists. They explore, they discover, they understand."}'::jsonb,
    ARRAY['science', 'observer', 'curiosité', 'question', 'expérience', 'découvrir', 'comprendre'],
    ARRAY['present tense', 'infinitives', 'articles']
  );

-- Insert comprehension questions
INSERT INTO comprehension_questions (segment_id, question, question_language, options, correct_answer, explanation)
VALUES
  -- Philosophy segment questions
  (
    'a1111111-1111-1111-1111-111111111111',
    'What does philosophy mean according to the segment?',
    'native',
    ARRAY['Love of wisdom', 'Love of science', 'Love of questions', 'Love of difficulty'],
    0,
    NULL
  ),
  (
    'a1111111-1111-1111-1111-111111111111',
    'How does philosophy begin?',
    'native',
    ARRAY['With a difficult book', 'With a simple question', 'With a teacher', 'With many years of study'],
    1,
    NULL
  ),
  (
    'a1111111-1111-1111-1111-111111111111',
    'Qu''est-ce que la philosophie ?',
    'target',
    ARRAY['L''amour de la sagesse', 'L''amour de la science', 'Une chose très difficile', 'Une matière scolaire'],
    0,
    'La philosophie est l''amour de la sagesse (love of wisdom).'
  ),
  
  -- Fitness segment questions
  (
    'a2222222-2222-2222-2222-222222222222',
    'According to the segment, what should we do every day?',
    'native',
    ARRAY['Run a marathon', 'Move/exercise', 'Go to the gym', 'Lift weights'],
    1,
    NULL
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'What does deep breathing do?',
    'native',
    ARRAY['Builds strength', 'Improves heart health', 'Calms the mind', 'Helps you run faster'],
    2,
    NULL
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Qu''est-ce qui est bon pour le cœur ?',
    'target',
    ARRAY['Respirer', 'Marcher', 'Dormir', 'Manger'],
    1,
    'Marcher (walking) est très bon pour le cœur (heart).'
  ),
  
  -- Science segment questions
  (
    'a3333333-3333-3333-3333-333333333333',
    'What is the scientific method?',
    'native',
    ARRAY['Read, memorize, repeat', 'Observe, question, test, learn', 'Study, practice, exam', 'Think, write, publish'],
    1,
    NULL
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Who are described as natural scientists?',
    'native',
    ARRAY['Only university professors', 'People with lab equipment', 'Even children', 'Only adults'],
    2,
    NULL
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Que fait un scientifique ?',
    'target',
    ARRAY['Il pose des questions', 'Il regarde la télévision', 'Il lit seulement', 'Il travaille seul'],
    0,
    'Un scientifique pose des questions (asks questions) et fait des expériences.'
  );
