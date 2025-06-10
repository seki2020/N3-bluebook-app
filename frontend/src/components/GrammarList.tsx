import React from 'react';
import GrammarPointCard from './GrammarPointCard';

interface GrammarPoint {
  chapter: number;
  pattern: string;
  readings?: string;
  connection_rules?: string;
  explanation_notes?: string;
  examples?: string;
  usage_notes?: string;
  [key: string]: any;
}

interface GrammarListProps {
  filteredGrammar: GrammarPoint[];
  grammarData: GrammarPoint[];
  onGrammarPointExpand?: (point: GrammarPoint) => void; // Add onGrammarPointExpand prop
}

const GrammarList: React.FC<GrammarListProps> = ({ filteredGrammar, grammarData, onGrammarPointExpand }) => {
  return (
    <div id="grammarList">
      {filteredGrammar.length === 0 ? (
        <div className="no-results">
          {grammarData.length === 0 ? '正在加载语法数据...' : '没有找到匹配的语法点。'}
        </div>
      ) : (
        filteredGrammar.map((point, index) => (
          <GrammarPointCard key={index} point={point} onExpand={onGrammarPointExpand} />
        ))
      )}
    </div>
  );
};

export default GrammarList;
