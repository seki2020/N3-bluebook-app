import React from 'react';

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

interface GrammarPointCardProps {
  point: GrammarPoint;
}

const GrammarPointCard: React.FC<GrammarPointCardProps> = ({ point }) => {
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

  const toggleGrammarPoint = (event: React.MouseEvent<HTMLDivElement>) => {
    const header = event.currentTarget;
    const grammarPointDiv = header.closest('.grammar-point');
    if (grammarPointDiv) {
      grammarPointDiv.classList.toggle('expanded');
    }
  };

  return (
    <div className="grammar-point">
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
  );
};

export default GrammarPointCard;
