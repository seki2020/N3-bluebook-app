import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ChapterFilter from '../components/ChapterFilter';
import GrammarList from '../components/GrammarList';
import LogModal from '../components/LogModal'; // Import the new LogModal component
import type { LogEntry } from '../types/LogEntry'; // Import LogEntry interface as a type

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
        let fetchedGrammarData: GrammarPoint[] = await grammarResponse.json();
        // Flatten the array if it's an array of arrays (from /api/chapters without chapterNo)
        if (fetchedGrammarData.length > 0 && Array.isArray(fetchedGrammarData[0])) {
          fetchedGrammarData = fetchedGrammarData.flat();
        }
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

  // Scroll to anchor when filteredGrammar changes and hash is present
  useEffect(() => {
    if (filteredGrammar.length > 0 && window.location.hash) {
      const id = decodeURIComponent(window.location.hash.substring(1));
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [filteredGrammar]);

  const handleChapterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const chapter = event.target.value;
    setSelectedChapter(chapter);
    localStorage.setItem('selectedChapter', chapter);
  };

  const handleGrammarPointExpand = useCallback((point: GrammarPoint) => {
    const logEntry: LogEntry = { // Use LogEntry type
      id: Date.now(),
      timestamp: Date.now(), // Use timestamp for sorting
      type: 'grammar_view',
      data: {
        grammarPoint: point.pattern,
        chapter: point.chapter,
      },
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('grammarViewLogs') || '[]') as LogEntry[]; // Use grammarViewLogs
      // Check if the last expanded grammar point is the same to avoid duplicate logs from rapid clicks
      if (existingLogs.length > 0 &&
          existingLogs[existingLogs.length - 1].type === 'grammar_view' &&
          existingLogs[existingLogs.length - 1].data.grammarPoint === logEntry.data.grammarPoint) {
        return;
      }
      const updatedLogs = [...existingLogs, logEntry];
      localStorage.setItem('grammarViewLogs', JSON.stringify(updatedLogs)); // Save to grammarViewLogs
    } catch (error) {
      console.error('Error saving grammar view log to localStorage:', error);
    }
  }, []);

  const [showLogModal, setShowLogModal] = useState(false); // State to control log modal visibility

  const handleTryQuiz = () => {
    if (selectedChapter === 'all') {
      alert('请选择一个具体的章节进行测验。');
      return;
    }
    navigate(`/quiz/${selectedChapter}`); // Use React Router for navigation
  };

  const handleOpenLogModal = () => {
    setShowLogModal(true);
  };

  const handleCloseLogModal = () => {
    setShowLogModal(false);
  };

  return (
    <>
      <Link to="/" style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', boxShadow: '2px 2px 5px rgba(0,0,0,0.2)', fontSize: '1.5em' }}>🏠</Link>
      <h1>蓝宝书N3语法</h1>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <ChapterFilter
        chapters={chapters}
        selectedChapter={selectedChapter}
        handleChapterChange={handleChapterChange}
        handleTryQuiz={handleTryQuiz}
      />

      <div id="totalCount" style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.1em', color: '#555' }}>
        总数: <span id="currentCount">{filteredGrammar.length}</span>
      </div>

      <GrammarList
        filteredGrammar={filteredGrammar}
        grammarData={grammarData}
        onGrammarPointExpand={handleGrammarPointExpand} // Pass the expand handler
      />

      {import.meta.env.MODE === 'development' && (
        <button
          onClick={handleOpenLogModal}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
          }}
        >
          Log
        </button>
      )}

      {showLogModal && <LogModal onClose={handleCloseLogModal} />}
    </>
  );
};

export default N3Page;
