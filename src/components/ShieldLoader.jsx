// Captain America-style shield preloader, drawn by hand in SVG.
// `progress` (0..1) fills the outer ring; omit it for an indeterminate spin.
export default function ShieldLoader({ progress, label = 'Loading', size = 120, overlay = false }) {
  const C = 2 * Math.PI * 58; // outer progress ring circumference
  const determinate = typeof progress === 'number';
  const body = (
    <div className={`shield-loader ${determinate ? '' : 'spin'}`} role="status" aria-live="polite" style={{ '--s': `${size}px` }}>
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <defs>
          <radialGradient id="shieldShine" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#fff" stopOpacity=".55" />
            <stop offset=".45" stopColor="#fff" stopOpacity=".05" />
            <stop offset="1" stopColor="#000" stopOpacity=".35" />
          </radialGradient>
        </defs>
        <circle cx="64" cy="64" r="58" className="sl-track" />
        <circle
          cx="64" cy="64" r="58" className="sl-progress"
          strokeDasharray={C}
          strokeDashoffset={determinate ? C * (1 - Math.min(1, Math.max(0, progress))) : C * 0.72}
          transform="rotate(-90 64 64)"
        />
        <g className="sl-disc">
          <circle cx="64" cy="64" r="50" fill="#b3131b" />
          <circle cx="64" cy="64" r="40" fill="#eeeef0" />
          <circle cx="64" cy="64" r="30" fill="#b3131b" />
          <circle cx="64" cy="64" r="21" fill="#1b3a8c" />
          <polygon
            fill="#f4f4f6"
            points="64,45.5 68.2,58.2 81.6,58.3 70.8,66.2 74.9,79 64,71.2 53.1,79 57.2,66.2 46.4,58.3 59.8,58.2"
          />
          <circle cx="64" cy="64" r="50" fill="url(#shieldShine)" />
          <circle cx="64" cy="64" r="49.5" fill="none" stroke="#000" strokeOpacity=".35" />
        </g>
      </svg>
      <span className="sl-label">
        {label}
        {determinate ? ` ${Math.round(progress * 100)}%` : ''}
      </span>
    </div>
  );
  return overlay ? <div className="shield-overlay">{body}</div> : body;
}
