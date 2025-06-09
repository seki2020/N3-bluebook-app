import React from 'react';

interface QuizQuestion {
  id: number;
  grammar_point_id: string;
  grammar_point: string;
  question: string;
  options: { [key: string]: string };
  answer: string;
  explanation: string;
}

interface QuizQuestionDisplayProps {
  currentQuestion: QuizQuestion | undefined;
  currentQuestionIndex: number;
  userAnswers: { [key: number]: string };
  handleOptionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const QuizQuestionDisplay: React.FC<QuizQuestionDisplayProps> = ({
  currentQuestion,
  currentQuestionIndex,
  userAnswers,
  handleOptionChange,
}) => {
  if (!currentQuestion) {
    return null;
  }

  return (
    <div id="questionDisplay">
      <div className="quiz-question">
        <p><strong>{currentQuestionIndex + 1}.</strong> {currentQuestion.question}</p>
        <div className="quiz-options">
          {Object.keys(currentQuestion.options).map(key => (
            <label key={key}>
              <input
                type="radio"
                name="quizOption"
                value={key}
                checked={userAnswers[currentQuestionIndex] === key}
                onChange={handleOptionChange}
                disabled={!!userAnswers[currentQuestionIndex]}
              />
              {key}: {currentQuestion.options[key]}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionDisplay;
