import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import useQuizData from '../hooks/useQuizData';
import QuizQuestionDisplay from '../components/QuizQuestionDisplay';
import QuizNavigation from '../components/QuizNavigation';
import QuizResultDisplay from '../components/QuizResultDisplay';
import ProgressBar from '../components/ProgressBar';

interface QuizQuestion {
  id: number;
  grammar_point_id: string;
  grammar_point: string;
  question: string;
  options: { [key: string]: string };
  answer: string;
  explanation: string;
}

const QuizPage: React.FC = () => {
  const { chNo } = useParams<{ chNo: string }>();
  const { quizData, loading, error } = useQuizData(chNo);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [quizResult, setQuizResult] = useState<{ message: string; type: 'correct' | 'incorrect' | '' }>({ message: '', type: '' });

  // Reset quiz state when quizData changes (e.g., new chapter loaded)
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResult({ message: '', type: '' });
  }, [quizData]);

  const currentQuestion = quizData[currentQuestionIndex];

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedOptionKey = event.target.value;
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedOptionKey }));
    checkAnswer(selectedOptionKey);
  };

  const checkAnswer = (selectedOptionKey: string) => {
    if (!currentQuestion) return;

    if (selectedOptionKey === currentQuestion.answer) {
      setQuizResult({ message: '回答正确！', type: 'correct' });
      setTimeout(() => {
        goToNextQuestion();
      }, 1000); // Automatically go to next question after 1 second
    } else {
      setQuizResult({ message: `回答错误。正确答案是: ${currentQuestion.answer}: ${currentQuestion.options[currentQuestion.answer]}。解释: ${currentQuestion.explanation}`, type: 'incorrect' });
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuizResult({ message: '', type: '' }); // Clear result for new question
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuizResult({ message: '', type: '' }); // Clear result for new question
    }
  };

  if (loading) {
    return <div className="no-results">正在加载习题数据...</div>;
  }

  if (error) {
    return <div className="no-results" style={{ color: 'red' }}>{error}</div>;
  }

  if (quizData.length === 0) {
    return <div className="no-results">当前章节没有找到习题数据。</div>;
  }

  return (
    <>
      <Link to="/n3" style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 15px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', boxShadow: '2px 2px 5px rgba(0,0,0,0.2)', fontSize: '1.5em' }}>🔙</Link>
      <h1>语法练习题 - 章节 {chNo}</h1>

      <div id="quizContainer" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <QuizQuestionDisplay
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          userAnswers={userAnswers}
          handleOptionChange={handleOptionChange}
        />
        <QuizNavigation
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={quizData.length}
          goToPrevQuestion={goToPrevQuestion}
          goToNextQuestion={goToNextQuestion}
        />
        <QuizResultDisplay quizResult={quizResult} />
      </div>

      <ProgressBar current={currentQuestionIndex} total={quizData.length} />
    </>
  );
};

export default QuizPage;
