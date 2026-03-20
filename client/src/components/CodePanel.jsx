import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

function CodePanel({ starterCodeMap, onSubmit, onRun }) {
  const [language, setLanguage] = useState('cpp');
  const [codeHistory, setCodeHistory] = useState(starterCodeMap || {});
  const [code, setCode] = useState(starterCodeMap?.cpp || '');

  useEffect(() => {
    if (starterCodeMap) {
      setCodeHistory(starterCodeMap);
      setCode(starterCodeMap['cpp'] || '');
      setLanguage('cpp');
    }
  }, [starterCodeMap]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setCodeHistory(prev => ({...prev, [language]: code}));
    setLanguage(newLang);
    setCode(codeHistory[newLang] !== undefined ? codeHistory[newLang] : (starterCodeMap[newLang] || ''));
  };

  return (
    <section className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
      <div className="panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <h2>Code Editor</h2>
          <select value={language} onChange={handleLanguageChange} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button 
            onClick={() => onRun && onRun(code, language)}
            className="run-btn"
            style={{ padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #30363d', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ▶ Run Code
          </button>
          <button 
            onClick={() => onSubmit && onSubmit(code, language)}
            className="submit-btn"
            style={{ padding: '0.4rem 1rem', background: '#2ea44f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Submit
          </button>
        </div>
      </div>
      <div className="editor-container" style={{ flexGrow: 1, padding: '10px 0', borderTop: '1px solid #333', transform: 'translateZ(0)', overflow: 'hidden', borderRadius: '0 0 24px 24px' }}>
        <Editor
          height="600px"
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
