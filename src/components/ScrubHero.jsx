import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SplitText from './SplitText.jsx';

// Scroll-scrubbed "Iron Man power" hero, built to the 10k-websites scrub standard:
// streamed Blob fetch with an honest ring, dt-normalized lerp, gated seeks,
// delta-gated DOM writes, paced caption bands, live static-hero gates, complete without video.

const VIDEO_URL = '/hero/hero-scrub.mp4';
const POSTER_URL = '/hero/hero-poster.jpg';
const VIDEO_BYTES = 6927926; // real encoded size: the fallback when Content-Length is missing

// Must match the CSS media queries in styles.css character for character.
export const GATES = [
  '(max-width: 720px)',
  '(orientation: portrait) and (max-width: 1024px)',
  '(orientation: portrait) and (pointer: coarse)',
  '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
  '(prefers-reduced-motion: reduce)',
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (p, e0, e1) => {
  const t = clamp((p - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export default function ScrubHero({ next, done, total, ready }) {
  const rootRef = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = root.querySelector('.sh-stage');
    const video = root.querySelector('video');
    const poster = root.querySelector('.sh-poster');
    const ring = root.querySelector('.sh-ring');
    const alt = root.querySelector('.sh-alt');
    const bands = [...root.querySelectorAll('.band')].map((el, i, all) => ({
      el,
      a: +el.dataset.a,
      b: +el.dataset.b,
      ramp: el.dataset.ramp ? +el.dataset.ramp : null,
      first: i === 0,
      last: i === all.length - 1,
      op: -1,
      k: -1,
    }));

    let target = 0;
    let shown = 0;
    let rafId = null;
    let lastTick = 0;
    let heroOnScreen = true;
    let scrubOn = false;
    let started = false;
    let initDone = false;
    let seekBusy = false;
    let pendingTime = null;
    let loadK = 0;
    let lastAlt = '';
    let lastAltAt = 0;
    let disposed = false;
    const ctrl = new AbortController();

    const heroProgress = () => {
      const r = root.getBoundingClientRect();
      const range = root.offsetHeight - innerHeight;
      return range > 0 ? clamp(-r.top / range, 0, 1) : 0;
    };

    function requestSeek(t) {
      if (!video.duration || !isFinite(t)) return;
      if (seekBusy) {
        pendingTime = t;
        return;
      }
      seekBusy = true;
      video.currentTime = t;
    }
    const onSeeked = () => {
      seekBusy = false;
      if (pendingTime !== null) {
        const t = pendingTime;
        pendingTime = null;
        requestSeek(t);
      }
    };
    const onVideoError = () => {
      seekBusy = false;
      pendingTime = null;
      failVideo();
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onVideoError);

    function updateCaptions(p, now = performance.now()) {
      for (const band of bands) {
        const { a, b } = band;
        const f = Math.min(0.02, (b - a) / 3);
        // first band skips the ease-in, last band skips the ease-out
        const inO = band.first ? 1 : smoothstep(p, a, a + f);
        const outO = band.last ? 1 : 1 - smoothstep(p, b - f, b);
        const op = inO * outO;
        let k = clamp((p - a) / (band.ramp || Math.min(0.025, (b - a) * 0.35)), 0, 1);
        if (band.first) k = Math.max(k, loadK);
        if (Math.abs(op - band.op) > 0.004) {
          band.op = op;
          band.el.style.opacity = op.toFixed(3);
          band.el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
        }
        if (Math.abs(k - band.k) > 0.008) {
          band.k = k;
          band.el.style.setProperty('--k', k.toFixed(3));
        }
      }
      // HUD altitude readout, ~10Hz and only on change
      if (now - lastAltAt > 100) {
        const txt = `ALT ${String(Math.round((1 - p) * 1240)).padStart(4, '0')} M`;
        if (txt !== lastAlt) {
          lastAlt = txt;
          lastAltAt = now;
          alt.textContent = txt;
        }
      }
    }

    function tick(now) {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      const k = 0.16;
      shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
      if (Math.abs(target - shown) < 0.0005) {
        shown = target;
        rafId = null;
        lastTick = 0;
      } else {
        rafId = requestAnimationFrame(tick);
      }
      requestSeek(shown * (video.duration || 0));
      updateCaptions(shown, now);
    }

    function onScroll() {
      target = heroProgress();
      if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
    }

    function failVideo() {
      stage.classList.add('video-failed');
      ring.classList.add('done');
    }

    async function loadHeroBlob() {
      let watchdog = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(VIDEO_URL, { priority: 'low', signal: ctrl.signal });
      if (!res.ok || !res.body) throw new Error('video ' + res.status);
      const totalBytes = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
      const reader = res.body.getReader();
      const chunks = [];
      let got = 0;
      let lastRing = 0;
      for (;;) {
        const { done: fin, value } = await reader.read();
        if (fin) break;
        clearTimeout(watchdog);
        watchdog = setTimeout(() => ctrl.abort(), 20000);
        chunks.push(value);
        got += value.length;
        const frac = Math.min(1, got / totalBytes);
        const now = performance.now();
        if (now - lastRing > 100 || frac === 1) {
          lastRing = now;
          ring.style.setProperty('--ld', Math.round(126 * (1 - frac)));
        }
      }
      clearTimeout(watchdog);
      if (disposed) return;
      ring.style.setProperty('--ld', 0);
      ring.classList.add('done');
      video.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
      video.load();
      video.addEventListener(
        'canplay',
        () => {
          requestSeek(heroProgress() * video.duration);
          stage.classList.add('video-ready');
        },
        { once: true }
      );
    }

    function startBlobFetch() {
      if (started) return;
      started = true;
      loadHeroBlob().catch(() => !disposed && failVideo());
    }

    function initHeroOnce() {
      if (initDone) return;
      initDone = true;
      poster.style.backgroundImage = `url('${POSTER_URL}')`;
      const img = new Image();
      img.onload = startBlobFetch;
      img.onerror = startBlobFetch;
      img.src = POSTER_URL;
      setTimeout(startBlobFetch, 4000);
    }

    function enableScrub() {
      if (scrubOn) return;
      scrubOn = true;
      initHeroOnce();
      addEventListener('scroll', onScroll, { passive: true });
      bands.forEach((b) => {
        b.op = -1;
        b.k = -1;
        b.el.style.removeProperty('opacity');
        b.el.style.removeProperty('visibility');
      });
      updateCaptions(heroProgress());
      onScroll();
    }
    function disableScrub() {
      if (!scrubOn) return;
      scrubOn = false;
      removeEventListener('scroll', onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      // pin to final states for the static layout
      bands.forEach((b) => {
        b.el.style.removeProperty('opacity');
        b.el.style.removeProperty('visibility');
        b.el.style.setProperty('--k', 1);
      });
    }
    function applyHeroMode() {
      if (GATES.some((q) => matchMedia(q).matches)) disableScrub();
      else enableScrub();
    }
    const MQLS = GATES.map((q) => matchMedia(q));
    MQLS.forEach((m) => m.addEventListener('change', applyHeroMode));
    applyHeroMode();

    const io = new IntersectionObserver(([e]) => {
      heroOnScreen = e.isIntersecting;
      if (heroOnScreen) onScroll();
    });
    io.observe(root);

    // band one's one-time load ramp, handed over to scroll (started by the effect below)
    api.current = {
      setLoadK(v, now) {
        loadK = v;
        if (scrubOn) updateCaptions(heroProgress(), now);
      },
    };

    return () => {
      disposed = true;
      api.current = null;
      ctrl.abort();
      if (rafId) cancelAnimationFrame(rafId);
      removeEventListener('scroll', onScroll);
      MQLS.forEach((m) => m.removeEventListener('change', applyHeroMode));
      io.disconnect();
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onVideoError);
      if (video.src.startsWith('blob:')) URL.revokeObjectURL(video.src);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let raf;
    const start = performance.now();
    const ramp = (now) => {
      const t = clamp((now - start) / 1300, 0, 1);
      api.current?.setLoadK(1 - Math.pow(1 - t, 3), now);
      if (t < 1) raf = requestAnimationFrame(ramp);
    };
    raf = requestAnimationFrame(ramp);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <section ref={rootRef} className="scrub-hero" aria-label="Introduction">
      <div className="sh-stage">
        <div className="sh-poster" aria-hidden="true" />
        <video className="sh-video" preload="none" muted playsInline aria-hidden="true" tabIndex={-1} />
        <div className="sh-scrim" aria-hidden="true" />

        {/* HUD layer: Iron Man style heads-up display, decorative */}
        <div className="sh-hud" aria-hidden="true">
          <span className="hud-corner tl" />
          <span className="hud-corner tr" />
          <span className="hud-corner bl" />
          <span className="hud-corner br" />
          <span className="hud-line hud-alt sh-alt">ALT 1240 M</span>
          <span className="hud-line hud-sys">PWR 100% · THRUST NOMINAL</span>
          <svg className="sh-ring" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth="3" />
            <circle
              cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3"
              strokeDasharray="126" style={{ strokeDashoffset: 'var(--ld,126)' }} transform="rotate(-90 24 24)"
            />
          </svg>
          <span className="sh-cue">Scroll</span>
        </div>

        <div className="sh-bands">
          <div className="band b1" data-a="0" data-b="0.22">
            <p className="hud-tag chip">Suit online</p>
            <SplitText as="h2" className="drift" mode="words" text="Every hero has a first flight." />
          </div>
          <div className="band b2" data-a="0.26" data-b="0.5" data-ramp="0.036">
            <SplitText as="h2" className="scatter" seed={21} text="39 films. One story, told in the order it happened." />
          </div>
          <div className="band b3" data-a="0.54" data-b="0.74">
            <h2 className="blur-sharp">
              <span className="soft" aria-hidden="true">Know what to watch first. Every time.</span>
              <span className="sharp">Know what to watch first. Every time.</span>
            </h2>
          </div>
          <div className="band b4 settle" data-a="0.78" data-b="1" data-ramp="0.06">
            <p className="eyebrow">The Marvel Cinematic Universe</p>
            <SplitText
              as="h1"
              className="rise"
              mode="words"
              em={[10]}
              text="From a cave in Afghanistan to the edge of the Multiverse."
            />
            <p className="settle-sub">
              39 films. Two sagas. One story. Follow every Marvel Studios movie in the order events happen, and see
              what to watch before each one.
            </p>
            <div className="settle-cta">
              <a className="btn btn-primary" href="#timeline">Explore the timeline</a>
              {next && (
                <Link className="btn btn-ghost" to={`/movie/${next.id}`}>
                  {done ? 'Continue with ' : 'Start with '}
                  {next.title}
                </Link>
              )}
            </div>
            <p className="settle-progress">
              <span className="mono">{done}/{total} watched</span>
              <span className="bar"><i style={{ width: `${pct}%` }} /></span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
