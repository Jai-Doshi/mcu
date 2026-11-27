import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IMG, MOVIES, PHASES, SAGAS, byRelease, chronological, isUpcoming } from '../data/movies.js';
import { useReveal, useWatched } from '../hooks.js';
import PosterCard from '../components/PosterCard.jsx';
import ScrubHero from '../components/ScrubHero.jsx';
import PhaseDropdown from '../components/PhaseDropdown.jsx';
import { CheckIcon } from '../components/WatchIcons.jsx';
import ArcReactor from '../components/ArcReactor.jsx';

const toMinutes = (rt) => {
  const h = /(\d+)h/.exec(rt)?.[1] || 0;
  const m = /(\d+)m/.exec(rt)?.[1] || 0;
  return +h * 60 + +m;
};

function useProgress(watched) {
  const released = MOVIES.filter((m) => !isUpcoming(m));
  const hours = Math.round(released.reduce((s, m) => s + toMinutes(m.runtime), 0) / 60);
  const done = released.filter((m) => watched.has(m.id)).length;
  const left = released
    .filter((m) => !watched.has(m.id))
    .reduce((s, m) => s + toMinutes(m.runtime), 0);
  const next = chronological.find((m) => !watched.has(m.id) && !isUpcoming(m));
  return { released, hours, done, left: Math.round(left / 60), next };
}

function Saga() {
  return (
    <section id="saga" className="saga">
      <div className="section-head reveal">
        <p className="eyebrow">The story so far</p>
        <h2>Two sagas, one universe</h2>
      </div>
      {SAGAS.map((saga) => (
        <article key={saga.id} className="saga-block">
          <div className="saga-banner reveal" style={{ backgroundImage: `url(${IMG.backdrop(saga.image)})` }}>
            <div>
              <h3>{saga.title}</h3>
              <p>{saga.span}</p>
            </div>
          </div>
          <ol className="chapters">
            {saga.chapters.map((c, i) => (
              <li key={c.heading} className="chapter reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                <span className="chapter-no">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{c.heading}</h4>
                  <p>{c.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </section>
  );
}

function TimelineNode({ movie, index, order, watched, toggle }) {
  const phase = PHASES[movie.phase];
  const side = index % 2 === 0 ? 'left' : 'right';
  const seen = watched.has(movie.id);
  return (
    <li className={`tl-node ${side} reveal`} data-watched={seen ? 'true' : undefined} style={{ '--phase': phase.color }}>
      <div className="tl-dot">
        <span>{order === 'chrono' ? movie.chronoOrder : index + 1}</span>
        {seen && <i className="tl-dot-check" aria-hidden="true"><CheckIcon size={9} /></i>}
      </div>
      <div className="tl-card">
        <PosterCard movie={movie} watched={watched.has(movie.id)} onToggle={toggle} size="sm" showMeta={false} />
        <div className="tl-body">
          <p className="tl-year">{order === 'chrono' ? movie.inUniverse : movie.release.slice(0, 4)}</p>
          <Link to={`/movie/${movie.id}`} className="tl-title">{movie.title}</Link>
          <p className="tl-sub">
            <span className="chip" style={{ borderColor: phase.color, color: phase.color }}>{phase.name}</span>
            {seen && (
              <span className="chip-watched">
                <CheckIcon size={10} /> Watched
              </span>
            )}
            <span>{order === 'chrono' ? `Released ${movie.release.slice(0, 4)}` : `Set in ${movie.inUniverse}`}</span>
            <span>{movie.runtime}</span>
          </p>
          <p className="tl-story">{movie.story.slice(0, 170).replace(/\s+\S*$/, '')}…</p>
          {movie.before.length > 0 && (
            <p className="tl-before">
              Watch first: <b>{movie.before.length}</b> film{movie.before.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

function Timeline() {
  const { watched, toggle } = useWatched();
  const [order, setOrder] = useState('chrono');
  const [isReverse, setIsReverse] = useState(false);
  const [phase, setPhase] = useState(0);
  const [q, setQ] = useState('');
  const [hideWatched, setHideWatched] = useState(false);

  const list = useMemo(() => {
    let base = order === 'chrono' ? [...chronological] : [...byRelease];
    if (isReverse) {
      base.reverse();
    }
    const needle = q.trim().toLowerCase();
    return base.filter(
      (m) =>
        (!phase || m.phase === phase) &&
        (!hideWatched || !watched.has(m.id)) &&
        (!needle ||
          m.title.toLowerCase().includes(needle) ||
          m.cast.some((c) => c.toLowerCase().includes(needle)))
    );
  }, [order, isReverse, phase, q, hideWatched, watched]);

  useReveal([list]);

  // Insert saga dividers in story order
  let lastSaga = null;

  return (
    <section id="timeline" className="timeline-section">
      <div className="section-head reveal">
        <p className="eyebrow">Timeline</p>
        <h2>
          {order === 'chrono'
            ? (isReverse ? 'In reverse story order' : 'In story order')
            : (isReverse ? 'In reverse release order' : 'In release order')}
        </h2>
        <p className="muted">
          {order === 'chrono'
            ? (isReverse
              ? 'Follow the events backwards through in-universe history, from the multiverse to WWII origins.'
              : 'Follow the events of the MCU as they happen in-universe, from World War II to the multiverse.')
            : (isReverse
              ? 'Browse MCU releases in reverse chronological order, from latest premieres to the original 2008 launch.'
              : 'Watch the films the way audiences first experienced them, phase by phase.')}
        </p>
      </div>

      <div className="controls">
        <div className="segmented-group">
          <div className="segmented" role="tablist">
            <button className={order === 'chrono' ? 'on' : ''} onClick={() => setOrder('chrono')}>Story order</button>
            <button className={order === 'release' ? 'on' : ''} onClick={() => setOrder('release')}>Release order</button>
          </div>
          <button
            type="button"
            className={`reverse-btn ${isReverse ? 'on' : ''}`}
            onClick={() => setIsReverse((prev) => !prev)}
            title={isReverse ? 'Currently reverse order. Click for ascending order' : 'Click for reverse chronological order'}
            aria-pressed={isReverse}
            aria-label="Toggle reverse chronological order"
          >
            <svg
              className={`reverse-icon ${isReverse ? 'is-reversed' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path d="M7 4v16m0 0l-4-4m4 4l4-4" />
              <path d="M17 20V4m0 0l-4 4m4-4l4 4" />
            </svg>
            <span>{isReverse ? 'Reverse' : 'Reverse'}</span>
            <span className="reverse-indicator" aria-hidden="true">{isReverse ? 'DESC' : 'ASC'}</span>
          </button>
        </div>
        <input
          className="search"
          type="search"
          placeholder="Search films, actors, characters…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="button"
          className={`btn-hide-watched ${hideWatched ? 'on' : ''}`}
          onClick={() => setHideWatched((prev) => !prev)}
          title={hideWatched ? 'Showing unwatched films only. Click to show all.' : 'Click to hide films marked as watched.'}
          aria-pressed={hideWatched}
        >
          <span className="btn-hide-icon" aria-hidden="true">
            {hideWatched ? (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M2 10s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5-8-5.5-8-5.5z" />
                <line x1="3" y1="3" x2="17" y2="17" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M2 10s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5-8-5.5-8-5.5z" />
                <circle cx="10" cy="10" r="2.5" />
              </svg>
            )}
          </span>
          <span>Hide watched</span>
        </button>
      </div>

      {/* Mobile Phase Dropdown + Eye Button Row */}
      <div className="mobile-filter-row">
        <PhaseDropdown value={phase} onChange={setPhase} />

        <button
          type="button"
          className={`mobile-eye-btn ${hideWatched ? 'on' : ''}`}
          onClick={() => setHideWatched((prev) => !prev)}
          aria-pressed={hideWatched}
          title={hideWatched ? 'Hide watched: ON. Tap to show all.' : 'Hide watched: OFF. Tap to hide watched.'}
          aria-label="Toggle hide watched"
        >
          {hideWatched ? (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
              <path d="M2 10s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5-8-5.5-8-5.5z" />
              <line x1="3" y1="3" x2="17" y2="17" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
              <path d="M2 10s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5-8-5.5-8-5.5z" />
              <circle cx="10" cy="10" r="2.5" />
            </svg>
          )}
        </button>
      </div>

      <div className="phase-chips">
        <button className={!phase ? 'on' : ''} onClick={() => setPhase(0)}>All phases</button>
        {Object.entries(PHASES).map(([n, p]) => (
          <button
            key={n}
            className={phase === +n ? 'on' : ''}
            style={{ '--phase': p.color }}
            onClick={() => setPhase(+n)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="empty">No films match your filters.</p>
      ) : (
        <ol className="timeline">
          {list.flatMap((m, i) => {
            // In story order, everything up to Endgame belongs to the Infinity Saga's narrative.
            const saga = order === 'chrono' ? (m.chronoOrder <= 23 ? 'infinity' : 'multiverse') : PHASES[m.phase].saga;
            const items = [];
            if (saga !== lastSaga) {
              lastSaga = saga;
              const s = SAGAS.find((x) => x.id === saga);
              items.push(
                <li key={`div-${saga}-${i}`} className="tl-divider reveal">
                  <span>{s.title}</span>
                </li>
              );
            }
            items.push(<TimelineNode key={m.id} movie={m} index={i} order={order} watched={watched} toggle={toggle} />);
            return items;
          })}
        </ol>
      )}
    </section>
  );
}

export default function Home({ ready = true }) {
  const { watched } = useWatched();
  const { released, hours, done, left, next } = useProgress(watched);
  useReveal([]);
  return (
    <>
      <ScrubHero next={next} done={done} total={released.length} ready={ready} />
      <ArcReactor
        stats={[
          { value: `${done}/${released.length}`, label: 'Films watched' },
          { value: `${Math.round((done / released.length) * 100)}%`, label: 'Saga complete' },
          { value: `${left}h`, label: `Left of ${hours}h` },
          { value: next ? next.title : 'All caught up', label: 'Up next in story order' },
        ]}
      />
      <Saga />
      <Timeline />
    </>
  );
}
