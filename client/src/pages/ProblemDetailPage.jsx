import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CodePanel from '../components/CodePanel';
import TestCasesPanel from '../components/TestCasesPanel';
import ExecutionResultsPanel from '../components/ExecutionResultsPanel';
import { fetchProblemBySlug } from '../services/problemService';

function ProblemDetailPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executionResult, setExecutionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProblem() {
      try {
        const data = await fetchProblemBySlug(slug);
        setProblem(data);
      } finally {
        setLoading(false);
      }
    }

    loadProblem();
  }, [slug]);

  const handleCodeSubmit = async (code, language) => {
    setIsSubmitting(true);
    setExecutionResult(null);
    try {
      const res = await fetch(`http://localhost:5000/api/problems/${problem.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language })
      });
      const result = await res.json();
      setExecutionResult(result);
    } catch (err) {
      console.error(err);
      setExecutionResult({ status: 'Error', stderr: 'Failed to connect to backend execution engine. Ensure Docker is running!' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading challenge...</div>;
  }

  if (!problem) {
    return (
      <div className="empty-state">
        <p>Problem not found.</p>
        <Link to="/">Back to problem list</Link>
      </div>
    );
  }

  return (
    <section className="problem-layout">
      <div className="panel panel--content">
        <Link to="/" className="back-link">← Back to problems</Link>
        <div className="problem-meta">
          <h1>{problem.title}</h1>
          <span className={`badge badge--${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
        </div>
        <p className="muted-text">Acceptance: {problem.acceptanceRate}</p>

        <div className="content-section">
          <h2>Description</h2>
          <p>{problem.description}</p>
        </div>

        <div className="content-section">
          <h2>Constraints</h2>
          <ul>
            {problem.constraints.map((constraint) => (
              <li key={constraint}>{constraint}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sidebar-stack">
        <CodePanel 
          starterCode={problem.starterCode.cpp || problem.starterCode.javascript}
          onSubmit={handleCodeSubmit}
        />
        {executionResult || isSubmitting ? (
          <ExecutionResultsPanel result={executionResult} isSubmitting={isSubmitting} />
        ) : (
          <TestCasesPanel examples={problem.examples} />
        )}
      </div>
    </section>
  );
}

export default ProblemDetailPage;
