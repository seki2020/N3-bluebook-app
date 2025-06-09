import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

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
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [quizResult, setQuizResult] = useState<{ message: string; type: 'correct' | 'incorrect' | '' }>({ message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/quiz/${chNo}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.quiz)) {
        setQuizData(data.quiz);
        setCurrentQuestionIndex(0); // Reset to first question on new chapter load
        setUserAnswers({}); // Clear answers
        setQuizResult({ message: '', type: '' }); // Clear result
      } else {
        setQuizData([]);
        setError('当前章节没有找到习题数据。');
      }
    } catch (err) {
      console.error('Error loading quiz data:', err);
      setQuizData([]);
      setError('加载习题数据失败，请检查文件路径和内容。');
    } finally {
      setLoading(false);
    }
  }, [chNo]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  const currentQuestion = quizData[currentQuestionIndex];

  const updateProgressBar = useCallback(() => {
    if (quizData.length === 0) {
      return { width: '0%', text: '0/0' };
    }
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    return { width: `${progress}%`, text: `${currentQuestionIndex + 1}/${quizData.length}` };
  }, [currentQuestionIndex, quizData.length]);

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

  const progressBar = updateProgressBar();

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
        <div id="questionDisplay">
          <div className="quiz-question">
            <p><strong>{currentQuestionIndex + 1}.</strong> {currentQuestion?.question}</p>
            <div className="quiz-options">
              {currentQuestion?.options && Object.keys(currentQuestion.options).map(key => (
                <label key={key}>
                  <input
                    type="radio"
                    name="quizOption"
                    value={key}
                    checked={userAnswers[currentQuestionIndex] === key}
                    onChange={handleOptionChange}
                    disabled={!!userAnswers[currentQuestionIndex]} // Disable after answer
                  />
                  {key}: {currentQuestion.options[key]}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="quiz-navigation">
          <button onClick={goToPrevQuestion} disabled={currentQuestionIndex === 0}>上一题</button>
          <button onClick={goToNextQuestion} disabled={currentQuestionIndex === quizData.length - 1}>下一题</button>
        </div>
        {quizResult.message && (
          <div className={`quiz-result ${quizResult.type}`}>
            {quizResult.message}
          </div>
        )}
      </div>

      <div id="quizProgressBarContainer" style={{ maxWidth: '900px', margin: '20px auto' }}>
        <div id="quizProgressBar" className="progress-bar">
          <div id="quizProgress" className="progress" style={{ width: progressBar.width }}></div>
        </div>
        <div id="quizProgressText" className="progress-text">{progressBar.text}</div>
      </div>
    </>
  );
};

export default QuizPage;
