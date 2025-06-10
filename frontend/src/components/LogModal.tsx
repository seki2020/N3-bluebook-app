import React, { useState, useEffect } from 'react';
import type { LogEntry } from '../types/LogEntry'; // Import LogEntry interface

interface LogModalProps {
  onClose: () => void;
}

const LogModal: React.FC<LogModalProps> = ({ onClose }) => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    try {
      const grammarViewLogs = JSON.parse(localStorage.getItem('grammarViewLogs') || '[]') as LogEntry[];
      const quizAttemptLogs = JSON.parse(localStorage.getItem('quizAttemptLogs') || '[]') as LogEntry[];

      const allLogs = [...grammarViewLogs, ...quizAttemptLogs];
      // Sort logs by timestamp in descending order (latest first)
      const sortedLogs = allLogs.sort((a, b) => b.timestamp - a.timestamp);
      setLogEntries(sortedLogs);
    } catch (error) {
      console.error('Error loading logs from localStorage:', error);
      setLogEntries([]);
    }
  }, []);

  const renderLogEntry = (entry: LogEntry) => {
    const date = new Date(entry.timestamp).toLocaleString();
    switch (entry.type) {
      case 'grammar_view':
        return (
          <div key={entry.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <p><strong>时间:</strong> {date}</p>
            <p><strong>行为:</strong> 展开语法点 "{entry.data.grammarPoint}" (章节: {entry.data.chapter})</p>
          </div>
        );
      case 'quiz_attempt': // Handle quiz_attempt type
        const status = entry.data.isCorrect ? '正确' : '错误';
        return (
          <div key={entry.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <p><strong>时间:</strong> {date}</p>
            <p><strong>行为:</strong> 完成章节 {entry.data.quizChapter} 测验题目 {entry.data.questionId}</p>
            <p><strong>题目:</strong> {entry.data.questionText}</p>
            <p><strong>您的答案:</strong> {entry.data.userAnswer}</p>
            <p><strong>正确答案:</strong> {entry.data.correctAnswer}</p>
            <p><strong>结果:</strong> <span style={{ color: entry.data.isCorrect ? 'green' : 'red' }}>{status}</span></p>
          </div>
        );
      default:
        return (
          <div key={entry.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <p><strong>时间:</strong> {date}</p>
            <p><strong>行为:</strong> 未知行为</p>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001,
      }}
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '80%',
          maxWidth: '600px',
          maxHeight: '80%',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the modal
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '1.5em',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>
        <h2>用户行为记录</h2>
        {logEntries.length === 0 ? (
          <p>暂无记录。</p>
        ) : (
          <div>
            {logEntries.map(renderLogEntry)}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogModal;
