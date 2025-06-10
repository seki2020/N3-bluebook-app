import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import useQuizData from '../hooks/useQuizData';
import QuizQuestionDisplay from '../components/QuizQuestionDisplay';
import QuizNavigation from '../components/QuizNavigation';
import QuizResultDisplay from '../components/QuizResultDisplay';
import ProgressBar from '../components/ProgressBar';
import type { LogEntry } from '../types/LogEntry'; // Import LogEntry interface as a type

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
  const navigate = useNavigate(); // Initialize useNavigate

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [quizResult, setQuizResult] = useState<{ message: string; type: 'correct' | 'incorrect' | '' }>({ message: '', type: '' });
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [lastAttemptedQuiz, setLastAttemptedQuiz] = useState<{ chapter: number; questionIndex: number } | null>(null);

  // Load last attempted quiz on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('quizProgress');
    if (savedProgress) {
      const { chapter, questionIndex } = JSON.parse(savedProgress);
      setLastAttemptedQuiz({ chapter, questionIndex });
      setShowContinueModal(true);
    }
  }, []); // Removed chNo from dependency array to check for any saved progress

  // Reset quiz state when quizData changes (e.g., new chapter loaded)
  // This effect runs when quizData changes, which happens when a new chapter is loaded.
  // It should reset the quiz state unless we are specifically trying to continue a saved quiz.
  useEffect(() => {
    // Only reset if the continue modal is NOT shown, or if the current chapter is different from the last attempted one
    // This prevents resetting when we navigate to the saved chapter to continue
    if (!showContinueModal || (lastAttemptedQuiz && parseInt(chNo || '0') !== lastAttemptedQuiz.chapter)) {
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizResult({ message: '', type: '' });
    }
  }, [quizData, showContinueModal, chNo, lastAttemptedQuiz]);

  // Effect to handle setting the current question index when continuing a quiz
  useEffect(() => {
    if (lastAttemptedQuiz && quizData.length > 0 && parseInt(chNo || '0') === lastAttemptedQuiz.chapter) {
      setCurrentQuestionIndex(lastAttemptedQuiz.questionIndex);
      setUserAnswers({});
      setQuizResult({ message: '', type: '' });
      setLastAttemptedQuiz(null); // Clear after setting to prevent re-triggering
      setShowContinueModal(false); // Close the modal once we've jumped
    }
  }, [quizData, lastAttemptedQuiz, chNo]);

  // Save quiz progress whenever currentQuestionIndex or chNo changes
  useEffect(() => {
    if (quizData.length > 0 && chNo) {
      localStorage.setItem('quizProgress', JSON.stringify({
        chapter: parseInt(chNo),
        questionIndex: currentQuestionIndex,
      }));
    }
  }, [currentQuestionIndex, chNo, quizData.length]);

  const currentQuestion = quizData[currentQuestionIndex];

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedOptionKey = event.target.value;
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedOptionKey }));
    checkAnswer(selectedOptionKey);
  };

  const recordQuizAttempt = useCallback((
    chapter: number,
    question: QuizQuestion,
    userAnswerKey: string,
    isCorrect: boolean
  ) => {
    const logEntry: LogEntry = {
      id: Date.now(),
      timestamp: Date.now(),
      type: 'quiz_attempt',
      data: {
        quizChapter: chapter,
        questionId: question.id,
        questionText: question.question,
        userAnswer: question.options[userAnswerKey],
        correctAnswer: question.options[question.answer],
        isCorrect: isCorrect,
      },
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('quizAttemptLogs') || '[]') as LogEntry[];
      const updatedLogs = [...existingLogs, logEntry];
      localStorage.setItem('quizAttemptLogs', JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Error saving quiz attempt log to localStorage:', error);
    }
  }, []);

  const checkAnswer = (selectedOptionKey: string) => {
    if (!currentQuestion) return;

    const chapterNumber = parseInt(chNo || '0');
    const isCorrect = selectedOptionKey === currentQuestion.answer;

    recordQuizAttempt(chapterNumber, currentQuestion, selectedOptionKey, isCorrect);

    if (isCorrect) {
      setQuizResult({ message: '回答正确！', type: 'correct' });
      setTimeout(() => {
        goToNextQuestion();
      }, 1000); // Automatically go to next question after 1 second
    } else {
      setQuizResult({ message: `回答错误。正确答案是: ${currentQuestion.answer}: ${currentQuestion.options[currentQuestion.answer]}。解释: ${currentQuestion.explanation}`, type: 'incorrect' });
    }
  };

  const handleContinueQuiz = () => {
    if (lastAttemptedQuiz) {
      // If current chapter is different from saved chapter, navigate first
      if (parseInt(chNo || '0') !== lastAttemptedQuiz.chapter) {
        // When navigating, the component will re-render and the useEffect for setting index will handle it
        navigate(`/quiz/${lastAttemptedQuiz.chapter}`);
      } else {
        // If already in the correct chapter, just set the index directly
        setCurrentQuestionIndex(lastAttemptedQuiz.questionIndex);
        setUserAnswers({});
        setQuizResult({ message: '', type: '' });
        setLastAttemptedQuiz(null); // Clear after handling
        setShowContinueModal(false); // Close the modal
      }
    }
  };

  const handleStartNewQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResult({ message: '', type: '' });
    setShowContinueModal(false);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuizResult({ message: '', type: '' }); // Clear result for new question
    }
    // No need to record quiz completion here, as each attempt is recorded
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

      {showContinueModal && lastAttemptedQuiz && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1002,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}>
            <h2>继续上次的测验？</h2>
            <p>您上次在章节 {lastAttemptedQuiz.chapter} 的第 {lastAttemptedQuiz.questionIndex + 1} 题。</p>
            <button
              onClick={handleContinueQuiz}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1em',
              }}
            >
              继续
            </button>
            <button
              onClick={handleStartNewQuiz}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1em',
              }}
            >
              重新开始
            </button>
          </div>
        </div>
      )}

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
