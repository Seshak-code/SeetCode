import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CodePanel from '../components/CodePanel';
import TestCasesPanel from '../components/TestCasesPanel';
import ExecutionResultsPanel from '../components/ExecutionResultsPanel';
import SubmissionsPanel from '../components/SubmissionsPanel';
import { fetchProblemBySlug } from '../services/problemService';
import { useAuth } from '../context/AuthContext';

function ProblemDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executionResult, setExecutionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [submissions, setSubmissions] = useState([]);

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

  const loadSubmissions = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5005/api/problems/${slug}/submissions?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Failed to load submissions', err);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [slug, user]);

  const handleCodeExecute = async (code, language, isRunMode = false) => {
    setIsSubmitting(true);
    setExecutionResult(null);
    try {
      const res = await fetch(`http://localhost:5005/api/problems/${problem.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language, isRunMode, userId: user?.id })
      });
      const result = await res.json();
      setExecutionResult(result);
      if (!isRunMode && user) {
        loadSubmissions();
        setActiveTab('submissions');
      }
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

        <div style={{ display: 'flex', gap: '1.5rem', margin: '2rem 0 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={() => setActiveTab('description')}
            style={{ fontWeight: 'bold', background: 'none', border: 'none', color: activeTab === 'description' ? '#fff' : '#8b949e', borderBottom: activeTab === 'description' ? '2px solid #8b5cf6' : '2px solid transparent', cursor: 'pointer', paddingBottom: '0.8rem' }}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('submissions')}
            style={{ fontWeight: 'bold', background: 'none', border: 'none', color: activeTab === 'submissions' ? '#fff' : '#8b949e', borderBottom: activeTab === 'submissions' ? '2px solid #8b5cf6' : '2px solid transparent', cursor: 'pointer', paddingBottom: '0.8rem' }}
          >
            Submissions
          </button>
        </div>

        {activeTab === 'description' ? (
          <>
            <div className="content-section">
              <div style={{ lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: problem.description }} />
            </div>

            <div className="content-section" style={{ marginTop: '2rem' }}>
              <h2>Examples & Test Cases</h2>
              <TestCasesPanel examples={problem.examples} />
            </div>

            <div className="content-section" style={{ marginTop: '2.5rem', marginBottom: '4rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <h2>Constraints</h2>
              <ul style={{ color: '#8b949e', fontFamily: 'monospace', lineHeight: '1.8' }}>
                {problem.constraints.map((constraint) => (
                  <li key={constraint}><code>{constraint}</code></li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="content-section">
            {!user ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#8b949e' }}>
                Please <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'underline' }}>sign in</Link> to save and view submissions.
              </div>
            ) : (
              <SubmissionsPanel 
                submissions={submissions}
              />
            )}
          </div>
        )}
      </div>

      <div className="sidebar-stack">
        <CodePanel 
          starterCodeMap={problem.starterCode}
          onSubmit={(code, language) => handleCodeExecute(code, language, false)}
          onRun={(code, language) => handleCodeExecute(code, language, true)}
        />
        {(executionResult || isSubmitting) && (
          <ExecutionResultsPanel result={executionResult} isSubmitting={isSubmitting} />
        )}
      </div>
    </section>
  );
}

export default ProblemDetailPage;
