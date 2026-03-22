import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import CodePanel from '../components/CodePanel';
import TestCasesPanel from '../components/TestCasesPanel';
import ExecutionResultsPanel from '../components/ExecutionResultsPanel';
import SubmissionsPanel from '../components/SubmissionsPanel';
import GraphicsEnginePanel from '../components/GraphicsEnginePanel';
import { fetchProblemBySlug, submitCode, fetchSubmissions } from '../services/problemService';
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
  const [currentGraphicsCode, setCurrentGraphicsCode] = useState('');

  // Resizable sidebar split: percentage of sidebar height given to the code editor
  const [editorFlex, setEditorFlex] = useState(55);
  const isDragging = useRef(false);
  const sidebarRef = useRef(null);

  const startDrag = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    const onMove = (ev) => {
      if (!isDragging.current || !sidebarRef.current) return;
      const rect = sidebarRef.current.getBoundingClientRect();
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const pct = Math.min(80, Math.max(20, ((clientY - rect.top) / rect.height) * 100));
      setEditorFlex(pct);
    };
    const stopDrag = () => { isDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', stopDrag); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', stopDrag); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', stopDrag);
  }, []);

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
      const data = await fetchSubmissions(slug, user.id);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions', err);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [slug, user]);

  const handleCodeExecute = async (logicCode, language, graphicsCode, firmwareCode, isRunMode = false) => {
    setIsSubmitting(true);
    setExecutionResult(null);
    setCurrentGraphicsCode(graphicsCode);

    try {
      const result = await submitCode(slug, logicCode, language, isRunMode, user?.id, firmwareCode || null);
      setExecutionResult(result);
      if (!isRunMode && user) {
        loadSubmissions();
        setActiveTab('submissions');
      }
    } catch (err) {
      console.error(err);
      setExecutionResult({
        status: 'Error',
        stderr: 'Failed to connect to the execution engine. Ensure Docker is running!',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Loading challenge...</div>;

  if (!problem) {
    return (
      <div className="empty-state">
        <p>Problem not found.</p>
        <Link to="/">Back to problem list</Link>
      </div>
    );
  }

  const tabStyle = (tab) => ({
    fontWeight: 'bold',
    background: 'none',
    border: 'none',
    color: activeTab === tab ? '#fff' : '#8b949e',
    borderBottom: activeTab === tab ? '2px solid #8b5cf6' : '2px solid transparent',
    cursor: 'pointer',
    paddingBottom: '0.8rem',
  });

  const isRobot = slug === 'robot-grid-tracker';

  return (
    <section className="problem-layout">
      <div className="panel panel--content" style={{ borderRadius: '16px' }}>
        <Link to="/" className="back-link" style={{ fontSize: '0.9rem' }}>← Back to problems</Link>
        <div className="problem-meta">
          <h1>{problem.title}</h1>
          <span className={`badge badge--${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
        </div>
        <p className="muted-text">Acceptance: {problem.acceptanceRate}</p>

        <div style={{ display: 'flex', gap: '1.5rem', margin: '2rem 0 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setActiveTab('description')} style={tabStyle('description')}>Description</button>
          {problem.hints && problem.hints.length > 0 && (
            <button onClick={() => setActiveTab('hints')} style={tabStyle('hints')}>
              {slug?.startsWith('robot-grid') ? 'Hardware Datasheet' : 'Hints'}
            </button>
          )}
          <button onClick={() => setActiveTab('submissions')} style={tabStyle('submissions')}>Submissions</button>
        </div>

        {activeTab === 'description' && (
          <>
            <div className="content-section">
              <div style={{ lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: problem.description }} />
            </div>

            <div className="content-section" style={{ marginTop: '2rem' }}>
              <h2>Examples &amp; Test Cases</h2>
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
        )}

        {activeTab === 'hints' && (() => {
          const isHardware = slug?.startsWith('robot-grid');
          if (!isHardware) {
            // ── Standard Hints (non-robot problems) ─────────────────
            return (
              <div className="content-section">
                <h2 style={{ marginBottom: '1.5rem' }}>Strategic Hints</h2>
                {problem.hints && problem.hints.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {problem.hints.map((hint, i) => (
                      <div key={i} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: '3px solid #f59e0b' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Hint {i + 1}</span>
                        <p style={{ margin: 0, color: '#c9d1d9', lineHeight: '1.5' }}>{hint}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#8b949e' }}>No hints available for this problem yet.</p>
                )}
              </div>
            );
          }

          // ── Hardware Datasheet (robot problems) ────────────────────
          const isL2 = slug?.includes('obstacles');
          const partNumber  = isL2 ? 'AZ-100-HW-REF-002' : 'AZ-100-HW-REF-001';
          const docTitle    = isL2 ? 'Hardware Abstraction Layer API Reference — LiDAR Rev' : 'Hardware Abstraction Layer API Reference';
          const revision    = isL2 ? 'Rev 2.4' : 'Rev 2.1';
          const issueDate   = '2024-Q1';

          const mono  = { fontFamily: '"Courier New", Courier, monospace' };
          const ds    = { background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', overflow: 'hidden', fontSize: '0.85rem', color: '#c9d1d9' };

          // Parse each hint — format is "DOC-XXXX: Title — Body"
          const parsedHints = (problem.hints || []).map((raw, i) => {
            const colonIdx = raw.indexOf(':');
            const dashIdx  = raw.indexOf(' — ');
            const docRef   = colonIdx > -1 ? raw.slice(0, colonIdx).trim() : `REF-${i+1}`;
            const rest     = colonIdx > -1 ? raw.slice(colonIdx + 1).trim() : raw;
            const title    = dashIdx > -1 ? rest.slice(0, rest.indexOf(' — ')).trim() : rest;
            const body     = dashIdx > -1 ? raw.slice(dashIdx + 3).trim() : '';
            return { docRef, title, body, index: i + 1 };
          });

          return (
            <div className="content-section" style={{ padding: 0 }}>
              {/* ── Document Header Block ─────────────────────────── */}
              <div style={{ ...ds, marginBottom: '1.5rem' }}>
                {/* Title bar */}
                <div style={{ background: '#161b22', padding: '0.6rem 1rem', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...mono, color: '#3b82f6', fontWeight: 'bold', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                    UNCLASSIFIED / PUBLIC
                  </span>
                  <span style={{ ...mono, color: '#8b949e', fontSize: '0.7rem' }}>
                    {partNumber}
                  </span>
                </div>
                {/* Doc body */}
                <div style={{ padding: '1rem 1.2rem' }}>
                  <div style={{ ...mono, color: '#e6edf3', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
                    AZ-100 Series Warehouse Logistics Robot
                  </div>
                  <div style={{ ...mono, color: '#c9d1d9', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {docTitle}
                  </div>
                  {/* Revision table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', ...mono, fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ background: '#161b22' }}>
                        {['REVISION', 'STATUS', 'ISSUE DATE', 'CLASSIFICATION', 'APPROVED BY'].map(h => (
                          <td key={h} style={{ padding: '0.3rem 0.75rem', color: '#8b949e', borderBottom: '1px solid #30363d', borderRight: '1px solid #30363d', textAlign: 'left' }}>{h}</td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {[revision, 'RELEASED', issueDate, 'UNCLASSIFIED', 'Platform Team'].map((v, ci) => (
                          <td key={ci} style={{ padding: '0.3rem 0.75rem', color: ci === 1 ? '#22c55e' : ci === 0 ? '#3b82f6' : '#c9d1d9', borderBottom: '1px solid #21262d', borderRight: '1px solid #21262d' }}>{v}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Footer bar */}
                <div style={{ background: '#161b22', padding: '0.4rem 1rem', borderTop: '1px solid #30363d', display: 'flex', gap: '2rem' }}>
                  {['MOTOR BUS', 'GYRO ARRAY', 'POSE REGISTER', isL2 ? 'LIDAR MODULE' : null].filter(Boolean).map(m => (
                    <span key={m} style={{ ...mono, color: '#8b949e', fontSize: '0.65rem', letterSpacing: '0.08em' }}>◆ {m}</span>
                  ))}
                </div>
              </div>

              {/* ── API Sections ──────────────────────────────────── */}
              {parsedHints.length === 0 && (
                <p style={{ color: '#8b949e' }}>No specifications available.</p>
              )}
              {parsedHints.map(({ docRef, title, body, index }) => (
                <div key={index} style={{ ...ds, marginBottom: '1rem' }}>
                  {/* Section header */}
                  <div style={{ background: '#161b22', padding: '0.5rem 1rem', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ ...mono, color: '#8b949e', fontSize: '0.7rem' }}>§ {index}.0</span>
                      <span style={{ ...mono, color: '#e6edf3', fontSize: '0.8rem', fontWeight: 'bold' }}>{title}</span>
                    </div>
                    <span style={{ ...mono, color: '#3b82f6', fontSize: '0.7rem', background: 'rgba(59,130,246,0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(59,130,246,0.3)' }}>
                      {docRef}
                    </span>
                  </div>
                  {/* Body */}
                  {body && (
                    <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #21262d' }}>
                      <p style={{ ...mono, margin: 0, color: '#c9d1d9', lineHeight: '1.7', fontSize: '0.8rem' }}>{body}</p>
                    </div>
                  )}
                  {/* See also footer */}
                  <div style={{ padding: '0.3rem 1rem', display: 'flex', gap: '1.5rem' }}>
                    <span style={{ ...mono, color: '#8b949e', fontSize: '0.65rem' }}>REF: {docRef} · APPLIES TO: AZ-100 Series · STATUS: NORMATIVE</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}


        {activeTab === 'submissions' && (
          <div className="content-section">
            {!user ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#8b949e' }}>
                Please <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'underline' }}>sign in</Link> to save and view submissions.
              </div>
            ) : (
              <SubmissionsPanel submissions={submissions} />
            )}
          </div>
        )}
      </div>

      <div className="sidebar-stack" ref={sidebarRef} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* EDITOR AREA */}
        <div style={{ flex: `${editorFlex} 1 0`, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CodePanel
            slug={slug}
            starterCodeMap={problem.starterCode}
            onSubmit={(logicCode, language, graphicsCode, firmwareCode) => handleCodeExecute(logicCode, language, graphicsCode, firmwareCode, false)}
            onRun={(logicCode, language, graphicsCode, firmwareCode) => handleCodeExecute(logicCode, language, graphicsCode, firmwareCode, true)}
          />
        </div>

        {/* DRAG HANDLE – always visible so users know they can resize */}
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          title="Drag to resize"
          style={{
            height: '6px', cursor: 'row-resize', flexShrink: 0,
            background: 'linear-gradient(to bottom, transparent 30%, rgba(139,92,246,0.35) 50%, transparent 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
            userSelect: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.55)'}
          onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(to bottom, transparent 30%, rgba(139,92,246,0.35) 50%, transparent 70%)'}
        >
          <div style={{ width: '40px', height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* RESULTS / GRAPHICS AREA */}
        <div style={{ flex: `${100 - editorFlex} 1 0`, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {(executionResult || isSubmitting) ? (
            problem.starterCode?.graphics ? (
              <GraphicsEnginePanel
                result={executionResult}
                graphicsCode={currentGraphicsCode || problem.starterCode.graphics}
                isSubmitting={isSubmitting}
              />
            ) : (
              <ExecutionResultsPanel result={executionResult} isSubmitting={isSubmitting} />
            )
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58', fontSize: '0.85rem', textAlign: 'center', gap: '0.5rem', flexDirection: 'column' }}>
              <span style={{ fontSize: '2rem' }}>⚡</span>
              <span>Run your code to see animations here</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProblemDetailPage;
