import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IMG, MOVIES, chronological, isUpcoming } from '../data/movies.js';
import { useWatched } from '../hooks.js';

// App-style bottom tab bar (phones only, see CSS).
// Layout: Home · Story · [Up next poster button] · Timeline · Suit
// - a glowing pill slides to the active side tab
// - the raised centre button shows the next unwatched film's poster inside a saga-progress ring
// - always visible, like a native app's tab bar
const SECTION_ID = { home: null, story: 'saga', timeline: 'timeline', suit: 'progress' };

const Icon = {
  home: (
    <>
      <path className="ic-fill" d="M4 10.8L12 4l8 6.8V20H4z" />
      <path d="M3 11.5L12 4l9 7.5M5.5 9.8V20h13V9.8M10 20v-5.5h4V20" />
    </>
  ),
  story: (
    <>
      <path className="ic-fill" d="M12 6.5C10.2 5 7.6 4.5 4 4.8v13.4c3.6-.3 6.2.2 8 1.7 1.8-1.5 4.4-2 8-1.7V4.8c-3.6-.3-6.2.2-8 1.7z" />
      <path d="M12 6.5C10.2 5 7.6 4.5 4 4.8v13.4c3.6-.3 6.2.2 8 1.7 1.8-1.5 4.4-2 8-1.7V4.8c-3.6-.3-6.2.2-8 1.7zM12 6.5v13.4" />
    </>
  ),
  timeline: (
    <>
      <circle className="ic-fill" cx="6" cy="12" r="2.4" />
      <path d="M6 3.5v5.1M6 15.4v5.1M10.5 7h9.5M10.5 12h7M10.5 17h9.5" />
      <circle cx="6" cy="12" r="2.4" />
    </>
  ),
  suit: (
    <>
      <circle className="ic-fill" cx="12" cy="12" r="3.2" />
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 6.6l4.7 8.1H7.3z" />
      <path d="M12 2.2v1.6M12 20.2v1.6M2.2 12h1.6M20.2 12h1.6" />
    </>
  ),
};

function useSectionSpy(enabled) {
  const [section, setSection] = useState('home');
  useEffect(() => {
    if (!enabled) return;
    let raf = null;
    const measure = () => {
      raf = null;
      const mid = innerHeight * 0.45;
      const top = (id) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity;
      setSection(
        top('timeline') <= mid ? 'timeline' : top('saga') <= mid ? 'story' : top('progress') <= mid ? 'suit' : 'home'
      );
    };
    const on = () => raf === null && (raf = requestAnimationFrame(measure));
    measure();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => {
      removeEventListener('scroll', on);
      removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);
  return section;
}

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { watched } = useWatched();
  const onHome = pathname === '/';
  const section = useSectionSpy(onHome);

  const released = MOVIES.filter((m) => !isUpcoming(m));
  const done = released.filter((m) => watched.has(m.id)).length;
  const pct = Math.round((done / released.length) * 100);
  const next = chronological.find((m) => !watched.has(m.id) && !isUpcoming(m)) || chronological[0];
  const onNext = pathname === `/movie/${next.id}`;

  const go = (id) => (e) => {
    e.preventDefault();
    const target = SECTION_ID[id];
    if (!onHome) {
      navigate(target ? `/#${target}` : '/');
      return;
    }
    if (!target) window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // slot order in the 5-column grid; the centre (2) is the poster button
  const side = [
    { id: 'home', label: 'Home', slot: 0, href: '/' },
    { id: 'story', label: 'Story', slot: 1, href: '/#saga' },
    { id: 'timeline', label: 'Timeline', slot: 3, href: '/#timeline' },
    { id: 'suit', label: `${pct}%`, aria: `Your progress, ${pct} percent watched`, slot: 4, href: '/#progress' },
  ];
  const activeTab = onHome ? side.find((t) => t.id === section) : null;

  return (
    <nav
      className="bottom-nav"
      aria-label="App navigation"
      style={{ '--slot': activeTab ? activeTab.slot : 2, '--pct': pct }}
    >
      <span className={`bn-pill ${activeTab ? '' : 'off'}`} aria-hidden="true" />
      {side.map((t) => {
        const on = activeTab?.id === t.id;
        return (
          <a
            key={t.id}
            href={t.href}
            onClick={go(t.id)}
            className={`bn-tab ${on ? 'on' : ''}`}
            style={{ gridColumn: t.slot + 1 }}
            aria-current={on ? 'page' : undefined}
            aria-label={t.aria}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {Icon[t.id]}
            </svg>
            <span className="bn-label">{t.id === 'suit' ? (on ? 'Suit' : t.label) : t.label}</span>
          </a>
        );
      })}

      <a
        href={`/movie/${next.id}`}
        onClick={(e) => {
          e.preventDefault();
          navigate(`/movie/${next.id}`);
        }}
        className={`bn-next ${onNext ? 'on' : ''}`}
        style={{ gridColumn: 3 }}
        aria-label={`Up next: ${next.title}`}
        aria-current={onNext ? 'page' : undefined}
      >
        <span className="bn-ring" aria-hidden="true">
          <img src={IMG.poster(next.poster, 'w154')} alt="" loading="lazy" decoding="async" />
          <span className="bn-play">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
          </span>
        </span>
        <span className="bn-label">Up next</span>
      </a>
    </nav>
  );
}
