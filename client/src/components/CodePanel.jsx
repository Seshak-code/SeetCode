function CodePanel({ starterCode }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Starter Code</h2>
        <select defaultValue="javascript">
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
      </div>
      <pre className="code-block">
        <code>{starterCode}</code>
      </pre>
    </section>
  );
}

export default CodePanel;
