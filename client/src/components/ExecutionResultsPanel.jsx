import React from 'react';

function ExecutionResultsPanel({ result, isSubmitting }) {
  if (isSubmitting) {
    return (
      <section className="panel results-panel" style={{ flexGrow: 1, minHeight: '300px' }}>
        <div className="panel__header">
          <h2>Execution Results</h2>
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
    <section className="panel results-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
      <div className="panel__header">
        <h2>Test Result</h2>
      </div>
      <div className="results-content" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        <div style={{ paddingBottom: '10px', borderBottom: '1px solid #30363d' }}>
          <h3 style={{ color: statusColor, margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: 'bold' }}>{result.status}</h3>
          {result.executionTimeMs > 0 && (
             <p style={{ margin: 0, fontWeight: 'bold', color: '#c9d1d9', fontSize: '0.9rem' }}>
                Runtime: <span style={{ color: '#fff' }}>{result.executionTimeMs} ms</span>
             </p>
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

        {result.stdout && (
          <div className="stdout-output">
            <h4 style={{ margin: '0 0 8px 0', color: '#8b949e', fontSize: '0.9rem', textTransform: 'uppercase' }}>Standard Output</h4>
            <pre style={{ background: '#161b22', border: '1px solid #30363d', padding: '12px', borderRadius: '6px', overflowX: 'auto', margin: 0, color: '#e6edf3', fontSize: '13px', fontFamily: 'monospace' }}>
              {result.stdout}
            </pre>
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
