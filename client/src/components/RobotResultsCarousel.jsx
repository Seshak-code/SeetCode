import { useState, useEffect } from 'react';
import RobotGrid from './RobotGrid';

/**
 * RobotResultsCarousel
 * Shows one grid per test case with left/right navigation.
 * Props:
 *   testPaths – array of { name, status, path }
 *               where path is an array of { x, y, dir } steps
 */
const RobotResultsCarousel = ({ testPaths = [] }) => {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  // When switching slides, stop any in-progress animation
  const switchTo = (idx) => {
    setPlaying(false);
    setTimeout(() => {
      setActive(idx);
      setPlaying(true);
    }, 50);
  };

  // Auto-play when the component first mounts or paths change
  useEffect(() => {
    if (testPaths.length > 0) {
      setActive(0);
      setPlaying(false);
      setTimeout(() => setPlaying(true), 100);
    }
  }, [testPaths]);

  if (testPaths.length === 0) return null;

  const current = testPaths[active];
  const isPassing = current?.status === 'PASS';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {/* Header row: nav + case label + pass/fail badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        {/* Left arrow */}
        <button
          onClick={() => switchTo((active - 1 + testPaths.length) % testPaths.length)}
          disabled={testPaths.length <= 1}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#c9d1d9',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '0.9rem',
            lineHeight: 1,
          }}
        >‹</button>

        {/* Case label */}
        <div style={{ flex: 1, textAlign: 'center', fontSize: '0.78rem', color: '#8b949e' }}>
          <span style={{ color: '#c9d1d9', fontWeight: 600 }}>{current.name}</span>
          &nbsp;·&nbsp;{active + 1} / {testPaths.length}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => switchTo((active + 1) % testPaths.length)}
          disabled={testPaths.length <= 1}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#c9d1d9',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '0.9rem',
            lineHeight: 1,
          }}
        >›</button>
      </div>

      {/* Pass/Fail pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <span style={{
          padding: '2px 10px',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          background: isPassing ? 'rgba(46,164,79,0.15)' : 'rgba(203,36,49,0.15)',
          color: isPassing ? '#2ea44f' : '#cb2431',
          border: `1px solid ${isPassing ? 'rgba(46,164,79,0.3)' : 'rgba(203,36,49,0.3)'}`,
        }}>
          {isPassing ? '● PASS' : '● FAIL'}
        </span>
        {/* Replay button */}
        <button
          onClick={() => { setPlaying(false); setTimeout(() => setPlaying(true), 50); }}
          title="Replay animation"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#8b949e',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '0.7rem',
            cursor: 'pointer',
          }}
        >↺ Replay</button>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
        {testPaths.map((t, i) => (
          <button
            key={i}
            onClick={() => switchTo(i)}
            title={t.name}
            style={{
              width: i === active ? '18px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === active
                ? (t.status === 'PASS' ? '#2ea44f' : '#cb2431')
                : 'rgba(255,255,255,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* The grid */}
      <RobotGrid path={current.path} playing={playing} speed={380} />
    </div>
  );
};

export default RobotResultsCarousel;
