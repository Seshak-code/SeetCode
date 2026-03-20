function TestCasesPanel({ examples = [] }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Examples</h2>
      </div>

      <div className="examples-list">
        {examples.map((example, index) => (
          <div key={index} className="example-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
            {example.image && (
                <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <img src={example.image} alt={`Visual Example ${index + 1}`} style={{ maxWidth: '380px', width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
                </div>
            )}
            <p style={{ margin: '0 0 10px 0' }}><strong style={{ color: '#fff' }}>Input:</strong> <span style={{ fontFamily: 'monospace', color: '#c9d1d9' }}>{example.input}</span></p>
            <p style={{ margin: '0 0 10px 0' }}><strong style={{ color: '#fff' }}>Output:</strong> <span style={{ fontFamily: 'monospace', color: '#c9d1d9' }}>{example.output}</span></p>
            {example.explanation ? <p style={{ margin: '0', lineHeight: '1.6', color: '#8b949e' }}><strong style={{ color: '#fff' }}>Explanation:</strong> {example.explanation}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default TestCasesPanel;
