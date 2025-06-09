import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = total === 0 ? 0 : ((current + 1) / total) * 100;
  const progressText = `${current + 1}/${total}`;

  return (
    <div id="quizProgressBarContainer" style={{ maxWidth: '900px', margin: '20px auto' }}>
      <div id="quizProgressBar" className="progress-bar">
        <div id="quizProgress" className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      <div id="quizProgressText" className="progress-text">{progressText}</div>
    </div>
  );
};

export default ProgressBar;
