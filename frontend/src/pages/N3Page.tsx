import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface GrammarPoint {
  chapter: number;
  pattern: string;
  readings?: string;
  connection_rules?: string;
  explanation_notes?: string;
  examples?: string;
  usage_notes?: string;
  [key: string]: any; // For other potential properties
}

const N3Page: React.FC = () => {
  const [grammarData, setGrammarData] = useState<GrammarPoint[]>([]);
  const [filteredGrammar, setFilteredGrammar] = useState<GrammarPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [chapters, setChapters] = useState<number[]>([]);
  const navigate = useNavigate();

  // Helper functions to render content
  const createListItem = (label: string, content?: string) => {
    if (!content) return null;
    return (
      <>
        <h3>{label}</h3>
        <ul>
          <li>
            {content.split('\n').map((item, index) => (
              <span key={index}>{item}<br /></span>
            ))}
          </li>
        </ul>
      </>
    );
  };

  const createExampleItem = (examplesContent?: string) => {
    if (!examplesContent) return null;
    const examples = examplesContent.split('\n\n').map((example, index) => {
      const parts = example.split(' CH: ');
      let japanese = parts[0] ? parts[0].replace('JP: ', '') : '';
      let chinese = parts[1] || '';
      let source = '';

      const sourceMatch = chinese.match(/\s\(Source: (.+?)\)$/);
      if (sourceMatch) {
        source = sourceMatch[1];
        chinese = chinese.replace(sourceMatch[0], '');
      }

      return (
        <div className="example-item" key={index}>
          <div className="japanese">{japanese}</div>
          <div className="chinese">{chinese}</div>
          {source && <div className="source">(Source: {source})</div>}
        </div>
      );
    });
    return (
      <>
        <h3>例句</h3>
        {examples}
      </>
    );
  };

  const filterGrammarPoints = useCallback(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const selectedChapterNum = selectedChapter === 'all' ? 'all' : parseInt(selectedChapter);

    const newFilteredData = grammarData.filter(point => {
      const matchesSearch = (
        (point.pattern && point.pattern.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (point.readings && point.readings.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (point.connection_rules && point.connection_rules.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (point.explanation_notes && point.explanation_notes.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (point.examples && point.examples.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (point.usage_notes && point.usage_notes.toLowerCase().includes(lowerCaseSearchTerm))
      );

      const matchesChapter = (selectedChapterNum === 'all' || point.chapter === selectedChapterNum);

      return matchesSearch && matchesChapter;
    });
    setFilteredGrammar(newFilteredData);
  }, [grammarData, searchTerm, selectedChapter]);

  // Load all grammar data and chapters on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Fetch all grammar data
        const grammarResponse = await fetch('/api/chapters');
        if (!grammarResponse.ok) {
          throw new Error(`HTTP error! status: ${grammarResponse.status}`);
        }
        const fetchedGrammarData: GrammarPoint[] = await grammarResponse.json();
        setGrammarData(fetchedGrammarData);

        // Extract unique chapter numbers
        const uniqueChapters = Array.from(new Set(fetchedGrammarData.map(point => point.chapter))).sort((a, b) => a - b);
        setChapters(uniqueChapters);

        // Load saved chapter from localStorage
        const savedChapter = localStorage.getItem('selectedChapter');
        if (savedChapter && uniqueChapters.includes(parseInt(savedChapter))) {
          setSelectedChapter(savedChapter);
        } else {
          setSelectedChapter('all'); // Default to 'all' if saved chapter is invalid
        }

      } catch (error) {
        console.error('Error loading initial data:', error);
        setChapters([]);
        setGrammarData([]);
      }
    };
    loadAllData();
  }, []); // Empty dependency array means this runs once on mount

  // Apply filter when grammarData, searchTerm, or selectedChapter changes
  useEffect(() => {
    filterGrammarPoints();
  }, [grammarData, searchTerm, selectedChapter, filterGrammarPoints]);

  // Removed the old localStorage useEffect as it's now handled in loadAllData
  // Removed the old grammar data fetching useEffect as it's now handled in loadAllData


  const handleChapterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const chapter = event.target.value;
    setSelectedChapter(chapter);
    localStorage.setItem('selectedChapter', chapter);
  };

  const handleTryQuiz = () => {
    if (selectedChapter === 'all') {
      alert('请选择一个具体的章节进行测验。');
      return;
    }
    navigate(`/quiz/${selectedChapter}`); // Use React Router for navigation
  };

  const handlePrintCards = () => {
    const grammarPoints = document.querySelectorAll('.grammar-point');
    const initiallyCollapsed: Element[] = [];

    grammarPoints.forEach(point => {
      if (!point.classList.contains('expanded')) {
        point.classList.add('expanded');
        initiallyCollapsed.push(point);
      }
    });

    window.print();

    setTimeout(() => {
      initiallyCollapsed.forEach(point => {
        point.classList.remove('expanded');
      });
    }, 100);
  };

  const toggleGrammarPoint = (event: React.MouseEvent<HTMLDivElement>) => {
    const header = event.currentTarget;
    const grammarPointDiv = header.closest('.grammar-point');
    if (grammarPointDiv) {
      grammarPointDiv.classList.toggle('expanded');
    }
  };

  return (
    <>
      <Link to="/" style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', boxShadow: '2px 2px 5px rgba(0,0,0,0.2)', fontSize: '1.5em' }}>🏠</Link>
      <h1>蓝宝书N3语法</h1>
      <input
        type="text"
        id="searchInput"
        placeholder="搜索语法点、解释、例句等..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div id="filterContainer" style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <label htmlFor="chapterFilter" style={{ marginRight: '10px', fontWeight: 'bold', color: '#555' }}>按章节筛选:</label>
        <select id="chapterFilter" style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em', outline: 'none' }} value={selectedChapter} onChange={handleChapterChange}>
          <option value="all">所有章节</option>
          {chapters.map(ch => (
            <option key={ch} value={ch}>{`章节: ${ch}`}</option>
          ))}
        </select>
        <button id="tryQuizButton" style={{ padding: '8px 15px', marginLeft: '15px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', fontSize: '1em', cursor: 'pointer' }} onClick={handleTryQuiz}>开始练习</button>
        {/* <button id="printCardsButton" style={{ padding: '8px 15px', marginLeft: '15px', borderRadius: '5px', border: 'none', backgroundColor: '#28a745', color: 'white', fontSize: '1em', cursor: 'pointer' }} onClick={handlePrintCards}>打印卡片</button> */}
      </div>

      <div id="totalCount" style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.1em', color: '#555' }}>
        总数: <span id="currentCount">{filteredGrammar.length}</span>
      </div>

      <div id="grammarList">
        {filteredGrammar.length === 0 ? (
          <div className="no-results">
            {grammarData.length === 0 ? '正在加载语法数据...' : '没有找到匹配的语法点。'}
          </div>
        ) : (
          filteredGrammar.map((point, index) => (
            <div className="grammar-point" key={index}>
              <div className="grammar-point-header" onClick={toggleGrammarPoint}>
                <div>
                  {point.pattern}
                  {point.readings && <span className="readings">{point.readings}</span>}
                </div>
                <span className="toggle-icon">▶</span>
              </div>
              <div className="grammar-details">
                {createListItem('接续', point.connection_rules)}
                {createListItem('说明', point.explanation_notes)}
                {createExampleItem(point.examples)}
                {createListItem('注意', point.usage_notes)}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default N3Page;
