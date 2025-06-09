import React from 'react';

interface QuizNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  goToPrevQuestion: () => void;
  goToNextQuestion: () => void;
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentQuestionIndex,
  totalQuestions,
  goToPrevQuestion,
  goToNextQuestion,
}) => {
  return (
    <div className="quiz-navigation">
      <button onClick={goToPrevQuestion} disabled={currentQuestionIndex === 0}>上一题</button>
      <button onClick={goToNextQuestion} disabled={currentQuestionIndex === totalQuestions - 1}>下一题</button>
    </div>
  );
};

export default QuizNavigation;
