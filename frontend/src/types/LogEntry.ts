export interface LogEntry {
  id: number;
  timestamp: number; // Use timestamp for sorting
  type: 'grammar_view' | 'quiz_attempt'; // Changed 'quiz_completion' to 'quiz_attempt'
  data: {
    grammarPoint?: string;
    chapter?: number;
    // For quiz_attempt
    quizChapter?: number;
    questionId?: number; // To precisely record which question
    questionText?: string;
    userAnswer?: string;
    correctAnswer?: string;
    isCorrect?: boolean; // Whether the attempt was correct or incorrect
  };
}
