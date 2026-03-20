import { useState } from 'react';

function SubmissionsPanel({ submissions, onSelectSubmission }) {
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (e, code, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (!submissions || submissions.length === 0) {
    return (
      <div style={{ color: '#8b949e', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>
        No submissions yet. Write some code and test it out!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {submissions.map((sub) => (
        <div
          key={sub.id}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onClick={() => {
            setExpandedId(expandedId === sub.id ? null : sub.id);
            if (onSelectSubmission) onSelectSubmission(sub.code, sub.language);
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
        >
          {/* Header row: status + timestamp */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', color: sub.status === 'Accepted' ? '#34d399' : '#f87171' }}>
              {sub.status}
            </span>
            <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>
              {new Date(sub.created_at).toLocaleString()}
            </span>
          </div>

          {/* Meta row: language + runtime */}
          <div style={{ fontSize: '0.9rem', color: '#c9d1d9', display: 'flex', gap: '1rem' }}>
            <span><strong>Language:</strong> {sub.language}</span>
            <span><strong>Runtime:</strong> {sub.execution_time_ms} ms</span>
          </div>

          {/* Optimizer feedback */}
          {sub.feedback && sub.feedback.length > 0 && (
            <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {sub.feedback.map((fb, idx) => (
                <div key={idx} style={{
                  background: fb.includes('Exceptional') ? 'rgba(52, 211, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: fb.includes('Exceptional') ? '#34d399' : '#fbbf24',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  marginBottom: '4px'
                }}>
                  {fb}
                </div>
              ))}
            </div>
          )}

          {/* Expanded code view */}
          {expandedId === sub.id && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontWeight: 'bold', color: '#c9d1d9' }}>Submitted Code</span>
                <button
                  onClick={(e) => handleCopy(e, sub.code, sub.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: copiedId === sub.id ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${copiedId === sub.id ? '#34d399' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '6px',
                    color: copiedId === sub.id ? '#34d399' : '#c9d1d9',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    padding: '4px 10px',
                    transition: 'all 0.2s',
                  }}
                >
                  {copiedId === sub.id ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre style={{
                background: '#0d1117',
                border: '1px solid #30363d',
                padding: '1rem',
                borderRadius: '8px',
                overflowX: 'auto',
                fontSize: '13px',
                fontFamily: 'monospace',
                margin: 0,
                color: '#e6edf3'
              }}>
                <code>{sub.code}</code>
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SubmissionsPanel;
