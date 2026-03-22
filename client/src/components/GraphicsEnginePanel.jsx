import { useState, useEffect, useRef } from 'react';

// Monochrome kite – points North by default
const KiteSVG = () => (
  <svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1 L17 11 L10 19 L3 11 Z" fill="rgba(200,200,210,0.85)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
    <line x1="10" y1="1" x2="10" y2="19" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6"/>
    <line x1="3" y1="11" x2="17" y2="11" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6"/>
    <circle cx="10" cy="11" r="1.2" fill="rgba(255,255,255,0.6)"/>
  </svg>
);

const DIR_DEG = { N: 0, E: 90, S: 180, W: 270 };

/**
 * DynamicSceneRenderer renders the grid + the animated kite.
 * `scene` shape: { gridWidth, gridHeight, trail: [{x,y,dir},...], hasKite }
 */
const DynamicSceneRenderer = ({ scene, playing, speed = 350 }) => {
  const [step, setStep] = useState(0);
  const intervalRef = useRef(null);

  const path = scene?.trail || [];
  const rows = scene?.gridHeight || 10;
  const cols = scene?.gridWidth || 10;

  // Restart animation whenever playing / path changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStep(0);
    if (!playing || path.length === 0) return;

    let cur = 0;
    intervalRef.current = setInterval(() => {
      cur += 1;
      if (cur >= path.length) {
        clearInterval(intervalRef.current);
        setStep(path.length - 1);
        return;
      }
      setStep(cur);
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [playing, path, speed]);

  if (!scene) return null;

  const current = path[step] || { x: 0, y: 0, dir: 'N' };
  // Track which cells were visited MORE THAN ONCE (retraced path)
  const visitCount = {};
  path.slice(0, step + 1).forEach(p => {
    const k = `${p.x},${p.y}`;
    visitCount[k] = (visitCount[k] || 0) + 1;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6e7681', fontFamily: 'monospace' }}>
        <span>{cols} × {rows}</span>
        <span>({current.x}, {current.y}) {current.dir}  step {step + 1}/{path.length}</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        flex: 1,
        gap: '1px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '6px',
        padding: '1px',
        minHeight: 0,
      }}>
        {Array.from({ length: rows * cols }).map((_, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = col;
          const y = rows - 1 - row; // (0,0) = bottom-left

           const isHere  = current.x === x && current.y === y;
           const cnt     = visitCount[`${x},${y}`] || 0;
           const wasHere = cnt > 0 && !isHere;
           const retraced = wasHere && cnt > 1;
           const isWall  = (scene.walls || []).some(w => w.x === x && w.y === y);

           return (
             <div
               key={idx}
               style={{ 
                 background: isWall ? '#1a1a1e' : '#0d1117', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 position: 'relative',
                 overflow: 'hidden'
               }}
             >
               {/* Wall texture / pattern */}
               {isWall && (
                 <div style={{
                   position: 'absolute',
                   inset: '2px',
                   background: 'linear-gradient(135deg, #2d2d35 0%, #1a1a1e 100%)',
                   border: '1px solid rgba(255,255,255,0.05)',
                   borderRadius: '2px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center'
                 }}>
                   <div style={{ width: '40%', height: '1px', background: 'rgba(255,255,255,0.03)', transform: 'rotate(45deg)' }} />
                 </div>
               )}

               {/* Trail dots – brighter / different colour on retraced cells */}
               {wasHere && !isWall && (
                <div style={{
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: retraced ? 'rgba(255,140,0,0.7)' : 'rgba(180,180,200,0.45)',
                  boxShadow: retraced ? '0 0 4px rgba(255,140,0,0.5)' : '0 0 3px rgba(200,200,220,0.3)',
                }} />
              )}

              {/* Origin marker */}
              {x === 0 && y === 0 && !isHere && (
                <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(139,92,246,0.3)', borderRadius: '1px', pointerEvents: 'none' }} />
              )}

              {/* The kite */}
              {isHere && scene.hasKite && (
                <div style={{
                  width: '75%', height: '75%',
                  transform: `rotate(${DIR_DEG[current.dir] ?? 0}deg)`,
                  transition: `transform ${speed * 0.7}ms ease`,
                  filter: 'drop-shadow(0 0 4px rgba(220,220,240,0.55))',
                }}>
                  <KiteSVG />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

function GraphicsEnginePanel({ result, graphicsCode, isSubmitting }) {
  const [activeCase, setActiveCase] = useState(0);
  const [sceneData, setSceneData] = useState(null);
  const [errorLogs, setErrorLogs] = useState(null);
  const [playing, setPlaying] = useState(false);

  const tests = result?.testDetails || [];

  // Re-evaluate the user's graphics code whenever the active case or result changes
  useEffect(() => {
    if (!tests.length) return;
    const testData = tests[activeCase];
    if (!testData) return;

    let localScene = { gridWidth: 10, gridHeight: 10, trail: [], hasKite: false };

    const engine = {
      setupGrid: (w, h) => { localScene.gridWidth = w; localScene.gridHeight = h; },
      drawTrail: (pathArr) => { localScene.trail = pathArr; },
      placeKite: () => { localScene.hasKite = true; },
      setWalls: (walls) => { localScene.walls = walls; },
    };

    try {
      const runner = new Function('engine', 'rawOutput', `
        ${graphicsCode}
        if (typeof renderGraphics === 'function') {
          renderGraphics(engine, rawOutput);
        } else {
          throw new Error("Missing function renderGraphics(engine, rawOutput)");
        }
      `);
      runner(engine, testData.visualData || testData.output);
      setSceneData(localScene);
      setErrorLogs(null);
      setPlaying(false);
      setTimeout(() => setPlaying(true), 60);
    } catch (e) {
      console.error('Graphics Engine Error:', e);
      setErrorLogs(e.message);
      setSceneData(null);
    }
  }, [activeCase, result, graphicsCode]);

  // --- Loading spinner while code is executing ---
  if (isSubmitting) {
    return (
      <section className="panel results-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div className="panel__header" style={{ padding: '0.8rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Test Animations</h2>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: '#8b949e' }}>
          <div style={{ width: '28px', height: '28px', border: '3px solid #3b3b3b', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <span style={{ fontSize: '0.85rem' }}>Running in sandbox…</span>
          <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
        </div>
      </section>
    );
  }

  if (!tests.length && !isSubmitting) {
    return (
      <section className="panel results-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58', fontSize: '0.85rem', gap: '0.4rem', flexDirection: 'column' }}>
        <span style={{ fontSize: '2rem' }}>🎬</span>
        <span>No results yet — hit Run</span>
      </section>
    );
  }

  const currentTest = tests[activeCase];
  const isPass = currentTest?.status === 'PASS';
  const overallStatus = result?.status;

  return (
    <section className="panel results-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* ── Header ─────────────────────────────── */}
      <div className="panel__header" style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Test Animations
          {overallStatus && (
            <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: overallStatus === 'Accepted' ? '#3fb950' : '#f85149', background: overallStatus === 'Accepted' ? 'rgba(46,164,79,0.1)' : 'rgba(203,36,49,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              {overallStatus}
            </span>
          )}
        </h2>
        {errorLogs && <span className="badge badge--hard" style={{ fontSize: '0.7rem' }}>Syntax Error</span>}
        {/* Navigation arrows in header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            disabled={activeCase === 0}
            onClick={() => setActiveCase(c => Math.max(0, c - 1))}
            style={{ background: '#21262d', border: '1px solid #30363d', color: activeCase === 0 ? '#484f58' : '#c9d1d9', width: '24px', height: '24px', borderRadius: '4px', cursor: activeCase === 0 ? 'not-allowed' : 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >‹</button>
          <span style={{ fontSize: '0.75rem', color: '#8b949e', minWidth: '60px', textAlign: 'center' }}>
            Case {activeCase + 1} / {tests.length}
          </span>
          <button
            disabled={activeCase === tests.length - 1}
            onClick={() => setActiveCase(c => Math.min(tests.length - 1, c + 1))}
            style={{ background: '#21262d', border: '1px solid #30363d', color: activeCase === tests.length - 1 ? '#484f58' : '#c9d1d9', width: '24px', height: '24px', borderRadius: '4px', cursor: activeCase === tests.length - 1 ? 'not-allowed' : 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >›</button>
          <span className="badge" style={{ background: isPass ? 'rgba(46,164,79,0.15)' : 'rgba(203,36,49,0.15)', color: isPass ? '#3fb950' : '#f85149', fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
            {isPass ? '✓ PASS' : '✗ FAIL'}
          </span>
          {!errorLogs && (
            <button
              onClick={() => { setPlaying(false); setTimeout(() => setPlaying(true), 60); }}
              style={{ background: 'transparent', border: '1px solid #30363d', color: '#c9d1d9', borderRadius: '4px', fontSize: '0.65rem', padding: '0.1rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >↺</button>
          )}
        </div>
      </div>

      {/* ── Dot indicators ─────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', padding: '0.4rem 0', flexShrink: 0 }}>
        {tests.map((t, i) => (
          <div
            key={i}
            onClick={() => setActiveCase(i)}
            title={`Case ${i + 1}: ${t.status}`}
            style={{
              width: '7px', height: '7px', borderRadius: '50%', cursor: 'pointer',
              transition: 'background 0.2s',
              background: i === activeCase
                ? '#8b5cf6'
                : t.status === 'PASS' ? '#2ea44f' : '#cb2431',
            }}
          />
        ))}
      </div>

      {/* ── Scene / Error ───────────────────────── */}
      <div style={{ flex: 1, padding: '0.6rem 1rem', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {errorLogs ? (
          <div style={{ padding: '1rem', background: 'rgba(203,36,49,0.1)', color: '#ff7b72', borderRadius: '6px', fontSize: '0.8rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', overflow: 'auto' }}>
            Error evaluating graphics code:{'\n'}{errorLogs}
            {'\n\n'}Check your "Graphics Programming" tab for syntax errors.
          </div>
        ) : (
          <DynamicSceneRenderer scene={sceneData} playing={playing} speed={380} />
        )}
      </div>
    </section>
  );
}

export default GraphicsEnginePanel;
