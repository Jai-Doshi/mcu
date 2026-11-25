import { useEffect, useRef, useState } from 'react';

// Stark Industries Arc Reactor (Mark LXXXV RT System)
// Press and hold the reactor to power up the suit's repulsor core and unlock saga diagnostics.
export default function ArcReactor({ stats }) {
  const ref = useRef(null);
  const [charged, setCharged] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [chargePercent, setChargePercent] = useState(charged ? 100 : 0);

  useEffect(() => {
    if (charged) {
      setChargePercent(100);
      return;
    }
    const el = ref.current;
    let p = 0;
    let holding = false;
    let raf = null;
    let last = 0;
    const loop = (now) => {
      const dt = Math.min(250, now - (last || now));
      last = now;
      p += holding ? dt / 1400 : -dt / 900; // ~1.4s to charge, eases back on release
      p = Math.max(0, Math.min(1, p));
      el.style.setProperty('--p', p.toFixed(3));
      setChargePercent(Math.round(p * 100));
      if (p >= 1) {
        setCharged(true);
        raf = null;
        return;
      }
      if (!holding && p === 0) {
        raf = null;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const down = (e) => {
      e.preventDefault();
      holding = true;
      el.classList.add('holding');
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const up = () => {
      holding = false;
      el.classList.remove('holding');
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const key = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (e.type === 'keydown' && !e.repeat) down(e);
        if (e.type === 'keyup') up();
      }
    };
    el.addEventListener('pointerdown', down);
    addEventListener('pointerup', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('keydown', key);
    el.addEventListener('keyup', key);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', down);
      removeEventListener('pointerup', up);
      el.removeEventListener('pointerleave', up);
      el.removeEventListener('keydown', key);
      el.removeEventListener('keyup', key);
    };
  }, [charged]);

  return (
    <section id="progress" className="reactor-section reveal" data-charged={charged ? 'true' : 'false'} aria-label="Your progress">
      <div className="reactor-copy">
        <div className="stark-badge">
          <span className="stark-badge-dot" />
          <span>STARK INDUSTRIES · MARK LXXXV</span>
        </div>
        <p className="eyebrow">Your suit, your progress</p>
        <h2>{charged ? 'Core fully energized.' : 'Hold to ignite arc core.'}</h2>
        <p className="muted">
          {charged
            ? 'Paladium-Vibranium fusion stable at 3.2 GJ/s. Review your MCU tactical watch records below.'
            : 'Press and hold Stark’s chest repulsor unit to charge the reactor and synchronize your saga archives.'}
        </p>
      </div>

      <div className="reactor-container">
        <div className="hud-brackets">
          <span className="bracket tl" />
          <span className="bracket tr" />
          <span className="bracket bl" />
          <span className="bracket br" />
        </div>

        <button
          ref={ref}
          className="reactor"
          style={{ '--p': charged ? 1 : 0 }}
          aria-label={charged ? 'Arc reactor fully powered' : 'Press and hold to power up the Arc Reactor'}
          aria-pressed={charged}
          type="button"
        >
          <svg viewBox="0 0 240 240" className="reactor-svg" aria-hidden="true">
            <defs>
              {/* Metallic Bezel Gradients */}
              <linearGradient id="metalBezel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#343c5b" />
                <stop offset="35%" stopColor="#1a2035" />
                <stop offset="70%" stopColor="#454f73" />
                <stop offset="100%" stopColor="#111524" />
              </linearGradient>

              <radialGradient id="housingDepth" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#04060c" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#080c18" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#161c30" stopOpacity="1" />
              </radialGradient>

              {/* Realistic Copper Solenoid Wire Gradient */}
              <linearGradient id="copperWire" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e28a38" />
                <stop offset="25%" stopColor="#ffc078" />
                <stop offset="50%" stopColor="#b45309" />
                <stop offset="75%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* Titanium Bracket Gradient */}
              <linearGradient id="bracketMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Unibeam Glowing Palladium Gradients */}
              <radialGradient id="corePlasma" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#bbf2f6" />
                <stop offset="65%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#0284c7" />
              </radialGradient>

              <radialGradient id="triGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#0369a1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
              </radialGradient>

              {/* High-intensity Glow Filter */}
              <filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur1" />
                <feGaussianBlur stdDeviation="9" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. Deep Reactor Well */}
            <circle cx="120" cy="120" r="114" fill="url(#housingDepth)" />

            {/* 2. Outer Heavy Titanium Bezel */}
            <circle cx="120" cy="120" r="113" fill="none" stroke="url(#metalBezel)" strokeWidth="6" />
            <circle cx="120" cy="120" r="110" fill="none" stroke="#0b0e1b" strokeWidth="1.5" />
            <circle cx="120" cy="120" r="106" fill="none" stroke="#252c48" strokeWidth="1" strokeDasharray="3 3" />

            {/* Outer Bezel Hex Bolts (10 perimeter industrial screws) */}
            {Array.from({ length: 10 }, (_, i) => (
              <g key={`bolt-${i}`} transform={`rotate(${i * 36} 120 120)`}>
                <circle cx="120" cy="13" r="2.8" fill="#1b2138" stroke="#4a5578" strokeWidth="1" />
                <polygon points="120,11.5 121.3,12.2 121.3,13.8 120,14.5 118.7,13.8 118.7,12.2" fill="#0c0f1c" />
              </g>
            ))}

            {/* 3. Outer Power Charge Ring Track */}
            <circle cx="120" cy="120" r="99" fill="none" stroke="rgba(0, 229, 255, 0.12)" strokeWidth="4" />
            <circle
              cx="120"
              cy="120"
              r="99"
              fill="none"
              stroke="#00f2ff"
              strokeWidth="4"
              strokeLinecap="round"
              className="rx-charge-stroke"
              pathLength="1"
              transform="rotate(-90 120 120)"
            />

            {/* 4. Solenoid Copper Wire Coils (10 authentic electromagnetic solenoids) */}
            {Array.from({ length: 10 }, (_, i) => (
              <g key={`solenoid-${i}`} transform={`rotate(${i * 36} 120 120)`} className="rx-solenoid">
                {/* Solenoid Core Body */}
                <rect x="113" y="26" width="14" height="28" rx="2" fill="url(#copperWire)" stroke="#5c2b06" strokeWidth="0.8" />
                {/* Copper Winding Grooves */}
                <line x1="113" y1="29" x2="127" y2="29" stroke="#ffe082" strokeWidth="1" opacity="0.8" />
                <line x1="113" y1="32" x2="127" y2="32" stroke="#451a03" strokeWidth="1" />
                <line x1="113" y1="35" x2="127" y2="35" stroke="#ffe082" strokeWidth="1" opacity="0.8" />
                <line x1="113" y1="38" x2="127" y2="38" stroke="#451a03" strokeWidth="1" />
                <line x1="113" y1="41" x2="127" y2="41" stroke="#ffe082" strokeWidth="1" opacity="0.8" />
                <line x1="113" y1="44" x2="127" y2="44" stroke="#451a03" strokeWidth="1" />
                <line x1="113" y1="47" x2="127" y2="47" stroke="#ffe082" strokeWidth="1" opacity="0.8" />
                <line x1="113" y1="50" x2="127" y2="50" stroke="#451a03" strokeWidth="1" />
                {/* Metallic Mounting Brackets */}
                <rect x="111.5" y="24" width="17" height="3" rx="1" fill="url(#bracketMetal)" stroke="#1e293b" strokeWidth="0.5" />
                <rect x="112" y="52" width="16" height="3" rx="1" fill="url(#bracketMetal)" stroke="#1e293b" strokeWidth="0.5" />
                {/* Solenoid Center Light Emitter / Solder Node */}
                <circle cx="120" cy="40" r="2.2" className="rx-coil-node" />
              </g>
            ))}

            {/* 5. Intermediate Armature Ring with Precision Laser Calibration Ticks */}
            <circle cx="120" cy="120" r="63" fill="none" stroke="rgba(159, 231, 255, 0.25)" strokeWidth="2" />
            <circle cx="120" cy="120" r="58" fill="none" stroke="rgba(159, 231, 255, 0.15)" strokeWidth="1" />
            {Array.from({ length: 30 }, (_, i) => (
              <line
                key={`tick-${i}`}
                x1="120"
                y1={i % 5 === 0 ? "57" : "60"}
                x2="120"
                y2="63"
                stroke={i % 5 === 0 ? "#00f2ff" : "rgba(159, 231, 255, 0.4)"}
                strokeWidth={i % 5 === 0 ? "1.5" : "0.75"}
                transform={`rotate(${i * 12} 120 120)`}
              />
            ))}

            {/* 6. Palladium Triangular Core Housing (Mark VI / Mark LXXXV Unibeam Architecture) */}
            <polygon
              points="120,72 162,144 78,144"
              fill="url(#triGlow)"
              className="rx-tri-outer"
            />
            <polygon
              points="120,74 159,142 81,142"
              fill="none"
              stroke="rgba(0, 229, 255, 0.45)"
              strokeWidth="3.5"
              strokeLinejoin="round"
              className="rx-tri-frame"
            />

            {/* Tri-Prong Energy Conduits / Braces */}
            <line x1="120" y1="64" x2="120" y2="92" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" className="rx-brace" />
            <line x1="168" y1="148" x2="144" y2="134" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" className="rx-brace" />
            <line x1="72" y1="148" x2="96" y2="134" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" className="rx-brace" />

            {/* 7. Inner Unibeam Fresnel Lens & Brilliant Core */}
            <circle cx="120" cy="120" r="32" fill="none" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="2" strokeDasharray="6 3" className="rx-inner-spin" />
            <circle cx="120" cy="120" r="24" fill="none" stroke="rgba(224, 247, 255, 0.6)" strokeWidth="1.5" />
            <circle
              cx="120"
              cy="120"
              r="18"
              fill="url(#corePlasma)"
              filter="url(#arcGlow)"
              className="rx-center-core"
            />

            {/* High-intensity Specular Flare */}
            <circle cx="120" cy="120" r="5" fill="#ffffff" opacity="0.85" className="rx-core-specular" />

            {/* In-circle Telemetry Text */}
            <text x="120" y="103" textAnchor="middle" className="rx-hud-text" fill="rgba(159, 231, 255, 0.7)">
              {charged ? '3.2 GJ' : `${chargePercent}%`}
            </text>
          </svg>

          {/* Reactor Radial Pulsing Glow & Shockwave */}
          <span className="rx-ambient-glow" />
          <span className="rx-shockwave" />
        </button>

        {/* Tactical HUD Telemetry Readout */}
        <div className="reactor-telemetry">
          <div className="telemetry-bar">
            <span className="telemetry-fill" style={{ width: `${chargePercent}%` }} />
          </div>
          <div className="telemetry-labels">
            <span>ARC RT-85</span>
            <span className="telemetry-status">
              {charged ? 'SYS NOMINAL · 100%' : chargePercent > 0 ? `IGNITING · ${chargePercent}%` : 'STANDBY · HOLD TO FIRE'}
            </span>
            <span>PALLADIUM</span>
          </div>
        </div>
      </div>

      <ul className="reactor-stats">
        {stats.map((s, i) => (
          <li key={s.label} style={{ '--i': i }} className="stat-card">
            <div className="stat-corner" />
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
