import { useEffect, useRef, useState } from 'react';

// Doctor Strange-style splash: a spell mandala draws itself, a spark portal spins open,
// and the site is revealed through the portal. Plays once per session; tap or key skips.
const KEY = 'mcu-splash-seen';

function seenThisSession() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Runic ticks around a ring
function Ticks({ r, n, len, w = 1 }) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const x1 = 200 + Math.cos(a) * r;
    const y1 = 200 + Math.sin(a) * r;
    const x2 = 200 + Math.cos(a) * (r - len);
    const y2 = 200 + Math.sin(a) * (r - len);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={w} />;
  });
}

function Mandala() {
  // Two interlocked squares + triangle (sling-ring style geometry, drawn from scratch)
  const sq = (rot) => (
    <rect x="95" y="95" width="210" height="210" transform={`rotate(${rot} 200 200)`} className="sp-draw" pathLength="1" />
  );
  return (
    <svg className="sp-mandala" viewBox="0 0 400 400" aria-hidden="true">
      <g className="sp-ring sp-r1">
        <circle cx="200" cy="200" r="190" className="sp-draw" pathLength="1" />
        <circle cx="200" cy="200" r="178" className="sp-draw thin" pathLength="1" />
        <g className="sp-ticks"><Ticks r={178} n={72} len={8} /></g>
      </g>
      <g className="sp-ring sp-r2">
        {sq(0)}
        {sq(45)}
        <circle cx="200" cy="200" r="148" className="sp-draw thin" pathLength="1" />
      </g>
      <g className="sp-ring sp-r3">
        <circle cx="200" cy="200" r="112" className="sp-draw" pathLength="1" />
        <polygon points="200,98 288,251 112,251" className="sp-draw" pathLength="1" />
        <polygon points="200,302 112,149 288,149" className="sp-draw thin" pathLength="1" />
        <g className="sp-ticks"><Ticks r={112} n={24} len={10} w={2} /></g>
      </g>
      <g className="sp-ring sp-r4">
        <circle cx="200" cy="200" r="62" className="sp-draw" pathLength="1" />
        <circle cx="200" cy="200" r="40" className="sp-draw thin" pathLength="1" />
      </g>
    </svg>
  );
}

// Spark portal on canvas: embers spinning around a growing ring
function usePortal(canvasRef, active) {
  useEffect(() => {
    if (!active) return;
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w, h, raf;
    const resize = () => {
      w = cv.width = innerWidth * dpr;
      h = cv.height = innerHeight * dpr;
    };
    resize();
    addEventListener('resize', resize);
    const N = 420;
    const parts = Array.from({ length: N }, () => ({
      a: Math.random() * Math.PI * 2,
      s: 0.012 + Math.random() * 0.03,
      off: (Math.random() - 0.5) * 0.12,
      life: Math.random(),
      size: 0.6 + Math.random() * 1.8,
    }));
    const t0 = performance.now();
    const draw = (now) => {
      const t = (now - t0) / 1000;
      // portal radius: sparks gather (0-1.1s), ring holds, then opens wide (2.1s+)
      const base = Math.min(w, h) * 0.2;
      const grow = t < 2.1 ? Math.min(1, t / 1.1) : 1 + Math.pow((t - 2.1) / 0.8, 2) * 6;
      const R = base * grow;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const cx = w / 2;
      const cy = h / 2;
      for (const p of parts) {
        p.a += p.s;
        p.life += 0.01;
        if (p.life > 1) p.life = 0;
        const r = R * (1 + p.off);
        const x = cx + Math.cos(p.a) * r;
        const y = cy + Math.sin(p.a) * r;
        // tangential streak
        const tx = -Math.sin(p.a) * 14 * dpr;
        const ty = Math.cos(p.a) * 14 * dpr;
        const alpha = Math.min(1, grow) * (0.35 + 0.65 * Math.sin(p.life * Math.PI));
        ctx.strokeStyle = `rgba(255,${150 + Math.floor(p.life * 80)},40,${alpha})`;
        ctx.lineWidth = p.size * dpr;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - tx, y - ty);
        ctx.stroke();
      }
      // falling embers off the ring
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2;
        ctx.fillStyle = 'rgba(255,190,80,0.8)';
        ctx.fillRect(cx + Math.cos(a) * R, cy + Math.sin(a) * R + Math.random() * 30 * dpr, 1.5 * dpr, 1.5 * dpr);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
    };
  }, [active, canvasRef]);
}

export default function StrangeSplash({ onDone }) {
  const [show] = useState(() => !seenThisSession() && !reduced());
  const [phase, setPhase] = useState('cast'); // cast -> open -> gone
  const canvasRef = useRef(null);
  usePortal(canvasRef, show && phase !== 'gone');

  useEffect(() => {
    if (!show) {
      onDone?.();
      return;
    }
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    document.body.classList.add('splash-lock');
    const t1 = setTimeout(() => setPhase('open'), 2100);
    const t2 = setTimeout(finish, 3100);
    function finish() {
      setPhase('gone');
      document.body.classList.remove('splash-lock');
      onDone?.();
    }
    const skip = () => {
      clearTimeout(t1);
      clearTimeout(t2);
      setPhase('open');
      setTimeout(finish, 600);
    };
    addEventListener('keydown', skip, { once: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      removeEventListener('keydown', skip);
      document.body.classList.remove('splash-lock');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show || phase === 'gone') return null;

  return (
    <div
      className={`strange-splash ${phase}`}
      onClick={() => {
        setPhase('open');
        setTimeout(() => {
          setPhase('gone');
          document.body.classList.remove('splash-lock');
          onDone?.();
        }, 600);
      }}
      aria-label="Opening animation. Click to skip."
    >
      <canvas ref={canvasRef} className="sp-canvas" aria-hidden="true" />
      <Mandala />
      <div className="sp-title">
        <span className="sp-kicker">The multiverse opens</span>
        <strong>MCU Chronicles</strong>
      </div>
      <span className="sp-skip">Tap to skip</span>
    </div>
  );
}
