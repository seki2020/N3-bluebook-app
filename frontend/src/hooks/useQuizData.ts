import { useState, useEffect, useCallback } from 'react';

interface QuizQuestion {
  id: number;
  grammar_point_id: string;
  grammar_point: string;
  question: string;
  options: { [key: string]: string };
  answer: string;
  explanation: string;
}

const useQuizData = (chNo: string | undefined) => {
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!chNo) {
      setError('未指定章节号。');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/quiz/${chNo}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.quiz)) {
        setQuizData(data.quiz);
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

  return { quizData, loading, error, fetchQuizData };
};

export default useQuizData;
