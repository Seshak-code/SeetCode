import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@shared/constants.js';

function CodePanel({ starterCodeMap, onSubmit, onRun, slug }) {
  const isHardwareSim = slug?.startsWith('robot-grid');
  const hasFirmware    = isHardwareSim && !!starterCodeMap?.logic?.cpp_firmware;
  const hasGraphics    = !!starterCodeMap?.graphics && !isHardwareSim;

  // Active tab: 'firmware' | 'logic' | 'graphics'
  const [activeTab, setActiveTab] = useState(isHardwareSim ? 'firmware' : 'logic');

  // Build the available language list from starterCode keys (excluding firmware/graphics keys)
  const availableLangIds = Object.keys(starterCodeMap?.logic || starterCodeMap || {})
    .filter(k => k !== 'graphics' && k !== 'cpp_firmware');
  const availableLangs = SUPPORTED_LANGUAGES.filter(l => availableLangIds.includes(l.id));
  const defaultLang = availableLangs.length > 0 ? availableLangs[0].id : DEFAULT_LANGUAGE;

  const [language, setLanguage]       = useState(defaultLang);
  const [logicHistory, setLogicHistory] = useState({});
  const [logicCode, setLogicCode]     = useState('');
  const [firmwareCode, setFirmwareCode] = useState('');
  const [graphicsCode, setGraphicsCode] = useState('');

  useEffect(() => {
    if (starterCodeMap) {
      const activeLang = availableLangIds.includes(language) ? language : defaultLang;

      if (starterCodeMap.logic) {
        setLogicHistory(starterCodeMap.logic);
        setLogicCode(starterCodeMap.logic[activeLang] || '');
        setFirmwareCode(starterCodeMap.logic.cpp_firmware || '');
        setGraphicsCode(starterCodeMap.graphics || '');
      } else {
        setLogicHistory(starterCodeMap);
        setLogicCode(starterCodeMap[activeLang] || '');
        setFirmwareCode('');
        setGraphicsCode('');
      }
      setLanguage(activeLang);
      setActiveTab(isHardwareSim ? 'firmware' : 'logic');
    }
  }, [starterCodeMap]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLogicHistory(prev => ({ ...prev, [language]: logicCode }));
    setLanguage(newLang);
    setLogicCode(logicHistory[newLang] !== undefined ? logicHistory[newLang] :
                 (starterCodeMap?.logic?.[newLang] || starterCodeMap?.[newLang] || ''));
  };

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.id === language);

  const tabStyle = (tabId) => ({
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    background: activeTab === tabId ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: activeTab === tabId ? '#fff' : '#8b949e',
    border: 'none',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
    borderBottom: activeTab === tabId ? '2px solid #8b5cf6' : '2px solid transparent',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  });

  // Determine current editor value and language
  const editorLang = 'cpp'; // always C++ for robot problems; falls back correctly for others
  const editorValue =
    activeTab === 'firmware' ? firmwareCode :
    activeTab === 'graphics' ? graphicsCode :
    logicCode;

  const handleEditorChange = (value) => {
    if (activeTab === 'firmware') setFirmwareCode(value);
    else if (activeTab === 'graphics') setGraphicsCode(value);
    else setLogicCode(value);
  };

  return (
    <section className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px', borderRadius: '16px', padding: '0' }}>
      <div className="panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.2rem 0 1.2rem', borderBottom: '1px solid #30363d' }}>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '100%' }}>
          {/* Firmware tab — only for hardware sim problems */}
          {hasFirmware && (
            <button style={tabStyle('firmware')} onClick={() => setActiveTab('firmware')}>
              Hardware Firmware
            </button>
          )}
          {/* Pathing Logic / Testing Logic tab */}
          <button style={tabStyle('logic')} onClick={() => setActiveTab('logic')}>
            {isHardwareSim ? 'Pathing Logic' : 'Testing Logic'}
          </button>
          {/* Graphics tab — non-robot problems only */}
          {hasGraphics && (
            <button style={tabStyle('graphics')} onClick={() => setActiveTab('graphics')}>
              Graphics Programming
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', paddingBottom: '0.6rem' }}>
          {/* Language dropdown — hidden for firmware tab (always C++) */}
          {activeTab === 'logic' && availableLangs.length > 0 && (
            <select
              value={language}
              onChange={handleLanguageChange}
              style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}
            >
              {availableLangs.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.label}</option>
              ))}
            </select>
          )}
          {activeTab === 'firmware' && (
            <span style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
              HAL · C++
            </span>
          )}
          <button
            onClick={() => onRun?.(logicCode, language, graphicsCode, firmwareCode)}
            className="run-btn"
            style={{ padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #30363d', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ▶ Run
          </button>
          <button
            onClick={() => onSubmit?.(logicCode, language, graphicsCode, firmwareCode)}
            className="submit-btn"
            style={{ padding: '0.4rem 1rem', background: '#2ea44f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            Submit
          </button>
        </div>
      </div>

      <div className="editor-container" style={{ flexGrow: 1, padding: '5px 0', transform: 'translateZ(0)', overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={activeTab === 'graphics' ? 'javascript' : (currentLang?.monacoId || editorLang)}
          theme="vs-dark"
          value={editorValue}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            // Firmware tab feels more like viewing a spec sheet — keep it readable
            readOnly: activeTab === 'firmware' ? false : false,
          }}
        />
      </div>
    </section>
  );
}

export default CodePanel;
