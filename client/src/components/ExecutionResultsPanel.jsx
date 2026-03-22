import React, { useState } from 'react';

function ExecutionResultsPanel({ result, isSubmitting }) {
  const [expandedTests, setExpandedTests] = useState(false);
  const [selectedCase, setSelectedCase] = useState(0);
  if (isSubmitting) {
    return (
      <section className="panel results-panel" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="panel__header" style={{ padding: '0.8rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Execution Results</h2>
        </div>
        <div className="results-content" style={{ padding: '40px 20px', textAlign: 'center', color: '#8b949e' }}>
          <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #3b3b3b', borderTopColor: '#58a6ff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '15px' }}></div>
          <p>Running C++ code in Sandbox...</p>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      </section>
    );
  }

  if (!result) return null;

  const isSuccess = result.status === 'Accepted';
  const statusColor = isSuccess ? '#2ea44f' : '#cb2431';

  return (
    <section className="panel results-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <div className="panel__header" style={{ padding: '0.8rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Test Result</h2>
      </div>
      <div className="results-content" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        <div style={{ paddingBottom: '10px', borderBottom: '1px solid #30363d' }}>
          <h3 style={{ color: statusColor, margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: 'bold' }}>{result.status}</h3>
          {Number(result.executionTimeMs) > 0 && (
             <p style={{ margin: 0, fontWeight: 'bold', color: '#c9d1d9', fontSize: '0.9rem' }}>
                Runtime: <span style={{ color: '#fff' }}>{result.executionTimeMs} ms</span>
             </p>
          )}
          
          {result.isRunMode ? (
            <div className="run-mode-results" style={{ marginTop: '5px' }}>
               <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                 {result.testDetails?.map((test, idx) => (
                   <button 
                     key={test.id}
                     onClick={() => setSelectedCase(idx)}
                     style={{ 
                       padding: '6px 14px', 
                       borderRadius: '8px', 
                       background: selectedCase === idx ? 'rgba(255,255,255,0.15)' : 'transparent',
                       border: 'none',
                       color: '#fff',
                       cursor: 'pointer',
                       fontWeight: '600',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '8px',
                       transition: 'all 0.2s',
                       fontSize: '0.95rem'
                     }}
                   >
                     <span style={{ color: test.status === 'PASS' ? '#2ea44f' : '#cb2431', fontSize: '1.2rem', lineHeight: '1' }}>{test.status === 'PASS' ? '☑' : '☒'}</span> Case {idx + 1}
                   </button>
                 ))}
               </div>
               
               {result.testDetails && result.testDetails[selectedCase] && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   {result.testDetails[selectedCase].input && (
                     <div>
                       <span style={{ fontSize: '0.9rem', color: '#c9d1d9', fontWeight: 'bold' }}>Input</span>
                       <pre style={{ margin: '8px 0 0 0', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontFamily: 'monospace', color: '#fff', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{result.testDetails[selectedCase].input}</pre>
                     </div>
                   )}
                   {result.testDetails[selectedCase].output && (
                     <div>
                       <span style={{ fontSize: '0.9rem', color: '#c9d1d9', fontWeight: 'bold' }}>Output</span>
                       <pre style={{ margin: '8px 0 0 0', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontFamily: 'monospace', color: result.testDetails[selectedCase].status === 'PASS' ? '#2ea44f' : '#cb2431', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{result.testDetails[selectedCase].output}</pre>
                     </div>
                   )}
                   {result.testDetails[selectedCase].expected && (
                     <div>
                       <span style={{ fontSize: '0.9rem', color: '#c9d1d9', fontWeight: 'bold' }}>Expected</span>
                       <pre style={{ margin: '8px 0 0 0', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontFamily: 'monospace', color: '#fff', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{result.testDetails[selectedCase].expected}</pre>
                     </div>
                   )}
                   {result.testDetails[selectedCase].message && !result.testDetails[selectedCase].input && (
                     <pre style={{ margin: '8px 0 0 0', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontFamily: 'monospace', color: result.testDetails[selectedCase].status === 'PASS' ? '#2ea44f' : '#cb2431', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{result.testDetails[selectedCase].message}</pre>
                   )}
                 </div>
               )}
            </div>
          ) : (
            result.total > 0 && (
              <div style={{ marginTop: '15px' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '1.1rem', color: result.passed === result.total ? '#2ea44f' : '#cb2431' }}>
                  Passed {result.passed} / {result.total} Test Cases
                </p>
                <button 
                  onClick={() => setExpandedTests(!expandedTests)} 
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #30363d', color: '#c9d1d9', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s', fontWeight: 'bold' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <span>{expandedTests ? 'Hide Detailed Test Case Results' : 'View Detailed Test Case Results'}</span>
                  <span style={{ transition: 'transform 0.2s', transform: expandedTests ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </button>
                
                {expandedTests && (
                  <div style={{ marginTop: '10px', maxHeight: '350px', overflowY: 'auto', background: '#0d1117', borderRadius: '6px', border: '1px solid #30363d' }}>
                    {result.testDetails?.map(test => (
                      <div key={test.id} style={{ display: 'flex', borderBottom: '1px solid #21262d', padding: '10px', alignItems: 'center' }}>
                        <span style={{ width: '50px', fontWeight: 'bold', color: '#8b949e', fontSize: '0.9rem' }}>#{test.id}</span>
                        <span style={{ width: '60px', fontWeight: 'bold', color: test.status === 'PASS' ? '#2ea44f' : '#cb2431', fontSize: '0.9rem' }}>{test.status}</span>
                        <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: '#c9d1d9' }}>{test.input ? `Input: ${test.input.substring(0, 30)}... | Output: ${test.output}` : test.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {result.feedback && result.feedback.length > 0 && (
          <div className="optimizer-feedback" style={{ background: '#252932', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #58a6ff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#58a6ff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
              💡 Algorithmic Optimizer
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6', color: '#c9d1d9' }}>
              {result.feedback.map((fb, i) => (
                <li key={i}>{fb}</li>
              ))}
            </ul>
          </div>
        )}

        {result.hints && result.hints.length > 0 && (
          <div className="hints-section" style={{ background: 'rgba(255, 191, 0, 0.05)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ffbf00', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ffbf00', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
              ⭐ Useful Hints
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6', color: '#c9d1d9' }}>
              {result.hints.map((hint, i) => (
                <li key={i}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {result.stderr && (
          <div className="stderr-output">
            <h4 style={{ margin: '0 0 8px 0', color: '#cb2431', fontSize: '0.9rem', textTransform: 'uppercase' }}>Standard Error</h4>
            <pre style={{ background: '#3b2326', color: '#ff7b72', padding: '12px', borderRadius: '6px', overflowX: 'auto', margin: 0, fontSize: '13px', fontFamily: 'monospace', border: '1px solid #cb2431' }}>
              {result.stderr}
            </pre>
          </div>
        )}

      </div>
    </section>
  );
}

export default ExecutionResultsPanel;
