import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IMG } from '../data/movies.js';
import { filmOf, heroById, suitsFor } from '../data/suits.js';
import { CheckIcon } from './WatchIcons.jsx';

// Full-screen, game-style character view for an unlocked suit.
// Landscape: suit stage on the left, info column on the right.
// Portrait: suit stage on top, info sheet below. Same content in both.
// Swipe the stage or use the arrow keys to step through the hero's unlocked levels.

function Arrow({ dir }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Lock({ size = 14 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function SuitShowcase({ suit, isUnlocked, onClose, onSelect }) {
  const hero = heroById[suit.hero];
  const film = filmOf(suit);
  const levels = suitsFor(suit.hero);
  const unlockedLevels = levels.filter(isUnlocked);
  const got = unlockedLevels.length;
  const idx = unlockedLevels.findIndex((s) => s.id === suit.id);
  const prev = unlockedLevels[idx - 1];
  const next = unlockedLevels[idx + 1];
  // the next level to earn: the first locked suit of this hero
  const nextLocked = levels.find((s) => !isUnlocked(s));
  const nextFilm = nextLocked && filmOf(nextLocked);
  const closeRef = useRef(null);
  const touch = useRef(null);

  useEffect(() => {
    document.body.classList.add('showcase-open');
    closeRef.current?.focus({ preventScroll: true });
    return () => document.body.classList.remove('showcase-open');
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && prev) onSelect(prev.id);
      else if (e.key === 'ArrowRight' && next) onSelect(next.id);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [prev, next, onClose, onSelect]);

  const onPointerDown = (e) => {
    touch.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    if (!touch.current) return;
    const dx = e.clientX - touch.current.x;
    const dy = e.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (dx < 0 && next) onSelect(next.id);
      if (dx > 0 && prev) onSelect(prev.id);
    }
  };

  return (
    <div
      className="showcase"
      role="dialog"
      aria-modal="true"
      aria-label={`${hero.name}: ${suit.name}`}
      style={{ '--hero': hero.color }}
    >
      <div className="ss-bg" style={{ backgroundImage: `url(${suit.img})` }} aria-hidden="true" />
      <div className="ss-vignette" aria-hidden="true" />

      <header className="ss-top">
        <button type="button" className="ss-back" onClick={onClose} aria-label="Back to vault">
          <Arrow dir="left" />
          <span>Vault</span>
        </button>
        <span className="ss-chip mono">
          {hero.name} · LV {suit.level}/{levels.length}
        </span>
        <button type="button" className="ss-close" onClick={onClose} ref={closeRef} aria-label="Close">
          ×
        </button>
      </header>

      <div className="ss-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <div className="ss-ring" aria-hidden="true" />
        <img key={suit.id} className="ss-suit" src={suit.img} alt={`${suit.name} suit`} draggable="false" />
        {prev && (
          <button type="button" className="ss-nav prev" onClick={() => onSelect(prev.id)} aria-label={`Previous level: ${prev.name}`}>
            <Arrow dir="left" />
          </button>
        )}
        {next && (
          <button type="button" className="ss-nav next" onClick={() => onSelect(next.id)} aria-label={`Next level: ${next.name}`}>
            <Arrow dir="right" />
          </button>
        )}
        <span className="ss-level-badge mono" aria-hidden="true">
          LV {suit.level}
        </span>
      </div>

      <aside className="ss-panel" key={`panel-${suit.id}`}>
        <p className="eyebrow ss-eyebrow">{hero.name}</p>
        <h1 className="ss-title">{suit.name}</h1>
        <p className="ss-blurb">{suit.blurb}</p>

        <section className="ss-block" aria-label="Level progress">
          <div className="ss-block-head">
            <span className="mono">Level progress</span>
            <strong>
              {got}/{levels.length}
            </strong>
          </div>
          <div className="ss-bar" aria-hidden="true">
            {levels.map((s) => (
              <i key={s.id} className={`${isUnlocked(s) ? 'on' : ''} ${s.id === suit.id ? 'current' : ''}`} />
            ))}
          </div>
          <div className="ss-levels" style={{ '--n': levels.length }}>
            {levels.map((s) => {
              const open = isUnlocked(s);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`ss-lv ${open ? 'open' : 'locked'} ${s.id === suit.id ? 'current' : ''}`}
                  onClick={() => open && onSelect(s.id)}
                  disabled={!open}
                  aria-current={s.id === suit.id ? 'true' : undefined}
                  aria-label={open ? `Level ${s.level}: ${s.name}` : `Level ${s.level} locked. Watch ${filmOf(s).title}`}
                  title={open ? s.name : `Watch ${filmOf(s).title}`}
                >
                  <img src={s.img} alt="" loading="lazy" />
                  <span className="mono">{open ? `LV ${s.level}` : <Lock size={12} />}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="ss-films">
          <Link to={`/movie/${film.id}`} className="ss-film">
            <img src={IMG.poster(film.poster, 'w342')} alt="" loading="lazy" />
            <span>
              <small className="mono">
                <CheckIcon size={10} /> Unlocked by
              </small>
              <b>{film.title}</b>
              <em>{film.release.slice(0, 4)}</em>
            </span>
          </Link>

          {nextLocked ? (
            <Link to={`/movie/${nextFilm.id}`} className="ss-film next">
              <img src={IMG.poster(nextFilm.poster, 'w342')} alt="" loading="lazy" />
              <span>
                <small className="mono">
                  <Lock size={10} /> Next · LV {nextLocked.level}
                </small>
                <b>Watch {nextFilm.title}</b>
                <em>Unlocks {nextLocked.name}</em>
              </span>
            </Link>
          ) : (
            <div className="ss-film complete">
              <span className="ss-max" aria-hidden="true">
                <CheckIcon size={22} />
              </span>
              <span>
                <small className="mono">Max level</small>
                <b>{hero.name} complete</b>
                <em>Every suit unlocked</em>
              </span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
