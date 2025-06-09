import React from 'react';

interface ChapterFilterProps {
  chapters: number[];
  selectedChapter: string;
  handleChapterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTryQuiz: () => void;
}

const ChapterFilter: React.FC<ChapterFilterProps> = ({
  chapters,
  selectedChapter,
  handleChapterChange,
  handleTryQuiz,
}) => {
  return (
    <div id="filterContainer" style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <label htmlFor="chapterFilter" style={{ marginRight: '10px', fontWeight: 'bold', color: '#555' }}>按章节筛选:</label>
      <select id="chapterFilter" style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em', outline: 'none' }} value={selectedChapter} onChange={handleChapterChange}>
        <option key="all" value="all">所有章节</option>
        {chapters.map((ch, index) => (
          <option key={index} value={ch}>{`章节: ${ch}`}</option>
        ))}
      </select>
      <button id="tryQuizButton" style={{ padding: '8px 15px', marginLeft: '15px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', fontSize: '1em', cursor: 'pointer' }} onClick={handleTryQuiz}>开始练习</button>
    </div>
  );
};

export default ChapterFilter;
