import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CodePanel from '../components/CodePanel';
import TestCasesPanel from '../components/TestCasesPanel';
import { fetchProblemBySlug } from '../services/problemService';

function ProblemDetailPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <CodePanel starterCode={problem.starterCode.javascript} />
        <TestCasesPanel examples={problem.examples} />
      </div>
    </section>
  );
}

export default ProblemDetailPage;
