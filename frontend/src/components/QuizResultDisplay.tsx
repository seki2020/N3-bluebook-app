import React from 'react';

interface QuizResult {
  message: string;
  type: 'correct' | 'incorrect' | '';
}

interface QuizResultDisplayProps {
  quizResult: QuizResult;
}

const QuizResultDisplay: React.FC<QuizResultDisplayProps> = ({ quizResult }) => {
  if (!quizResult.message) {
    return null;
  }

  return (
    <div className={`quiz-result ${quizResult.type}`}>
      {quizResult.message}
    </div>
  );
};

export default QuizResultDisplay;
