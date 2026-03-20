import { useState } from 'react';

function SubmissionsPanel({ submissions, onSelectSubmission }) {
  const [expandedId, setExpandedId] = useState(null);

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              fontWeight: 'bold', 
              color: sub.status === 'Accepted' ? '#34d399' : '#f87171'
            }}>
              {sub.status}
            </span>
            <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>
              {new Date(sub.created_at).toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#c9d1d9', display: 'flex', gap: '1rem' }}>
            <span><strong>Language:</strong> {sub.language}</span>
            <span><strong>Runtime:</strong> {sub.execution_time_ms} ms</span>
          </div>
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
          {expandedId === sub.id && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.8rem', color: '#c9d1d9' }}>Submitted Code:</div>
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
