import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

function CodePanel({ starterCode, onSubmit }) {
  const [code, setCode] = useState(starterCode || '');
  const [language, setLanguage] = useState('cpp');

  useEffect(() => {
    setCode(starterCode);
  }, [starterCode]);

  return (
    <section className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
      <div className="panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <h2>Code Editor</h2>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>
        <button 
          onClick={() => onSubmit && onSubmit(code, language)}
          className="run-btn"
          style={{ padding: '0.4rem 1rem', background: '#2ea44f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Submit Solution
        </button>
      </div>
      <div className="editor-container" style={{ flexGrow: 1, padding: '10px 0', borderTop: '1px solid #333' }}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value)}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            wordWrap: "on"
          }}
        />
      </div>
    </section>
  );
}

export default CodePanel;
