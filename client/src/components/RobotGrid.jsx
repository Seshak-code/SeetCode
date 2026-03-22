import { useState, useEffect, useRef } from 'react';

// Monochrome minimal kite SVG – points upward in "N" orientation
const KiteSVG = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Kite body: two triangles forming a diamond, top half taller */}
    <path d="M10 1 L17 11 L10 19 L3 11 Z" fill="rgba(200,200,210,0.85)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
    {/* Spine */}
    <line x1="10" y1="1" x2="10" y2="19" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6"/>
    {/* Cross spar */}
    <line x1="3" y1="11" x2="17" y2="11" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6"/>
    {/* Centre dot */}
    <circle cx="10" cy="11" r="1.2" fill="rgba(255,255,255,0.6)"/>
  </svg>
);

const ORIENT = {
  N: 'rotate(0deg)',
  E: 'rotate(90deg)',
  S: 'rotate(180deg)',
  W: 'rotate(270deg)',
};

/**
 * Self-animating Robot Grid.
 * Props:
 *   path    – array of { x, y, dir } steps produced by the parser
 *   playing – boolean; resets and re-plays when flipped to true
 *   speed   – ms per step (default 400)
 */
const RobotGrid = ({ path = [{ x: 0, y: 0, dir: 'N' }], playing = false, speed = 400 }) => {
  const [step, setStep] = useState(0);
  const intervalRef = useRef(null);
  const rows = 10;
  const cols = 10;

  // Reset + animate whenever `playing` changes to true or `path` changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStep(0);

    if (!playing || path.length === 0) return;

    let current = 0;
    intervalRef.current = setInterval(() => {
      current += 1;
      if (current >= path.length) {
        clearInterval(intervalRef.current);
        setStep(path.length - 1);
        return;
      }
      setStep(current);
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [playing, path, speed]);

  const current = path[step] || { x: 0, y: 0, dir: 'N' };
  const visitedSet = new Set(path.slice(0, step).map(p => `${p.x},${p.y}`));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
    }}>
      {/* Position badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6e7681', fontFamily: 'monospace' }}>
        <span>10 × 10</span>
        <span>({current.x}, {current.y}) {current.dir}</span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: '100%',
        aspectRatio: '1 / 1',
        gap: '1px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '6px',
        padding: '1px',
      }}>
        {Array.from({ length: rows * cols }).map((_, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = col;
          const y = rows - 1 - row; // (0,0) = bottom-left

          const isHere = current.x === x && current.y === y;
          const wasHere = visitedSet.has(`${x},${y}`) && !isHere;

          return (
            <div
              key={idx}
              style={{
                background: '#0d1117',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {wasHere && (
                <div style={{
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  background: 'rgba(180,180,200,0.45)',
                  boxShadow: '0 0 3px rgba(200,200,220,0.3)',
                }} />
              )}
              {isHere && (
                <div style={{
                  width: '75%',
                  height: '75%',
                  transform: ORIENT[current.dir] || 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                  filter: 'drop-shadow(0 0 3px rgba(220,220,240,0.5))',
                }}>
                  <KiteSVG />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step counter */}
      <div style={{ textAlign: 'center', fontSize: '0.68rem', color: '#484f58' }}>
        step {step + 1} / {path.length}
      </div>
    </div>
  );
};

export default RobotGrid;
