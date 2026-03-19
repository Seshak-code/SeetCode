function TestCasesPanel({ examples = [] }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Examples</h2>
      </div>

      <div className="examples-list">
        {examples.map((example, index) => (
          <div key={index} className="example-card">
            <p><strong>Input:</strong> {example.input}</p>
            <p><strong>Output:</strong> {example.output}</p>
            {example.explanation ? <p><strong>Explanation:</strong> {example.explanation}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default TestCasesPanel;
