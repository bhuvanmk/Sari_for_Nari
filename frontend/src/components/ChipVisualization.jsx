import React from 'react';

/**
 * ChipVisualization — animated PCB microchip with signal traces flowing inward.
 * Pure SVG + CSS animations. No external libraries.
 * Respects prefers-reduced-motion via CSS.
 */
export default function ChipVisualization() {
  // Each trace: an orthogonal (right-angle) SVG path flowing INTO the chip
  // d = SVG path data, dur = animation duration, delay = stagger
  const traces = [
    // ─── TOP traces ───
    { d: 'M 200 0 L 200 60 L 230 60 L 230 120', dur: '3.2s', delay: '0s' },
    { d: 'M 280 0 L 280 40 L 260 40 L 260 120', dur: '2.8s', delay: '0.6s' },
    { d: 'M 350 0 L 350 50 L 290 50 L 290 120', dur: '3.5s', delay: '1.2s' },
    // ─── BOTTOM traces ───
    { d: 'M 200 400 L 200 340 L 230 340 L 230 280', dur: '3.0s', delay: '0.3s' },
    { d: 'M 280 400 L 280 350 L 260 350 L 260 280', dur: '3.4s', delay: '0.9s' },
    { d: 'M 350 400 L 350 330 L 290 330 L 290 280', dur: '2.9s', delay: '1.5s' },
    // ─── LEFT traces ───
    { d: 'M 0 160 L 80 160 L 80 200 L 150 200', dur: '3.1s', delay: '0.2s' },
    { d: 'M 0 220 L 60 220 L 60 230 L 150 230', dur: '2.7s', delay: '0.8s' },
    { d: 'M 0 280 L 90 280 L 90 260 L 150 260', dur: '3.6s', delay: '1.4s' },
    // ─── RIGHT traces ───
    { d: 'M 500 160 L 420 160 L 420 200 L 350 200', dur: '3.3s', delay: '0.5s' },
    { d: 'M 500 220 L 430 220 L 430 230 L 350 230', dur: '2.6s', delay: '1.1s' },
    { d: 'M 500 280 L 410 280 L 410 260 L 350 260', dur: '3.0s', delay: '1.7s' },
  ];

  // Chip pin nubs: small rectangles on each side of the chip body
  const pinWidth = 8;
  const pinLength = 14;
  const chipX = 150, chipY = 120, chipW = 200, chipH = 160;
  const pinsPerSide = 5;

  const generatePins = () => {
    const pins = [];
    // Top pins
    for (let i = 0; i < pinsPerSide; i++) {
      const x = chipX + 20 + i * ((chipW - 40) / (pinsPerSide - 1)) - pinWidth / 2;
      pins.push(<rect key={`t${i}`} x={x} y={chipY - pinLength} width={pinWidth} height={pinLength} rx={1.5} fill="#232b36" />);
    }
    // Bottom pins
    for (let i = 0; i < pinsPerSide; i++) {
      const x = chipX + 20 + i * ((chipW - 40) / (pinsPerSide - 1)) - pinWidth / 2;
      pins.push(<rect key={`b${i}`} x={x} y={chipY + chipH} width={pinWidth} height={pinLength} rx={1.5} fill="#232b36" />);
    }
    // Left pins
    for (let i = 0; i < pinsPerSide; i++) {
      const y = chipY + 16 + i * ((chipH - 32) / (pinsPerSide - 1)) - pinWidth / 2;
      pins.push(<rect key={`l${i}`} x={chipX - pinLength} y={y} width={pinLength} height={pinWidth} rx={1.5} fill="#232b36" />);
    }
    // Right pins
    for (let i = 0; i < pinsPerSide; i++) {
      const y = chipY + 16 + i * ((chipH - 32) / (pinsPerSide - 1)) - pinWidth / 2;
      pins.push(<rect key={`r${i}`} x={chipX + chipW} y={y} width={pinLength} height={pinWidth} rx={1.5} fill="#232b36" />);
    }
    return pins;
  };

  return (
    <div className="chip-viz-container" aria-hidden="true">
      {/* Faint circuit-grid background texture */}
      <div className="chip-grid-texture" />

      <svg
        className="chip-svg"
        viewBox="0 0 500 400"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for signal pulse: cyan → violet leading edge */}
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3fe0ff" stopOpacity="0" />
            <stop offset="40%" stopColor="#3fe0ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7c6cff" stopOpacity="1" />
          </linearGradient>

          {/* Chip ambient glow filter */}
          <filter id="chipGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.247  0 0 0 0 0.878  0 0 0 0 1  0 0 0 0.5 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Trace glow filter */}
          <filter id="traceGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.247  0 0 0 0 0.878  0 0 0 0 1  0 0 0 0.6 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Circuit traces (static dim lines) ── */}
        {traces.map((t, i) => (
          <path
            key={`static-${i}`}
            d={t.d}
            fill="none"
            stroke="rgba(63, 224, 255, 0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}

        {/* ── Animated signal pulses along traces ── */}
        {traces.map((t, i) => (
          <path
            key={`pulse-${i}`}
            className="chip-trace-pulse"
            d={t.d}
            fill="none"
            stroke="url(#pulseGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#traceGlow)"
            style={{
              strokeDasharray: '30 600',
              animationDuration: t.dur,
              animationDelay: t.delay,
            }}
          />
        ))}

        {/* ── Pin nubs ── */}
        {generatePins()}

        {/* ── Chip body ── */}
        <rect
          x={chipX} y={chipY}
          width={chipW} height={chipH}
          rx={10} ry={10}
          fill="#10151d"
          stroke="#232b36"
          strokeWidth="2"
        />

        {/* ── Chip inner die / accent square ── */}
        <rect
          x={chipX + 40} y={chipY + 35}
          width={chipW - 80} height={chipH - 70}
          rx={5} ry={5}
          fill="none"
          stroke="rgba(63, 224, 255, 0.15)"
          strokeWidth="1"
        />

        {/* ── Chip center dot + ambient glow ── */}
        <circle
          className="chip-center-glow"
          cx={chipX + chipW / 2}
          cy={chipY + chipH / 2}
          r="16"
          fill="none"
          stroke="#3fe0ff"
          strokeWidth="1.5"
          filter="url(#chipGlow)"
        />
        <circle
          className="chip-center-dot"
          cx={chipX + chipW / 2}
          cy={chipY + chipH / 2}
          r="5"
          fill="#3fe0ff"
        />

        {/* ── Corner alignment marks on chip body ── */}
        <circle cx={chipX + 14} cy={chipY + 14} r="4" fill="#1a2030" stroke="#232b36" strokeWidth="1" />
      </svg>
    </div>
  );
}
