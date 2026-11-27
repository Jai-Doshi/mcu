import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IMG, PHASES, byId, chronological, isUpcoming, leadsInto, parseCast } from '../data/movies.js';
import { TRAILERS } from '../data/trailers.js';
import { useReveal, useWatched } from '../hooks.js';
import PosterCard, { useJustWatched } from '../components/PosterCard.jsx';
import { CheckIcon, EyeIcon } from '../components/WatchIcons.jsx';
import ShieldLoader from '../components/ShieldLoader.jsx';
import NotFound from './NotFound.jsx';

// Preload the page's HD hero images behind the shield preloader.
function useHeroImages(movie) {
  const [state, setState] = useState({ id: null, loaded: 0 });
  useEffect(() => {
    if (!movie) return;
    let alive = true;
    let count = 0;
    setState({ id: movie.id, loaded: 0 });
    const urls = [IMG.poster(movie.poster, 'w780'), IMG.backdrop(movie.backdrop, 'original')];
    const bump = () => {
      if (!alive) return;
      count += 1;
      setState({ id: movie.id, loaded: count });
    };
    urls.forEach((u) => {
      const im = new Image();
      im.onload = bump;
      im.onerror = bump;
      im.src = u;
    });
    const t = setTimeout(() => alive && setState({ id: movie.id, loaded: 2 }), 8000);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [movie]);
  const loaded = state.id === movie?.id ? state.loaded : 0;
  return { progress: loaded / 2, done: loaded >= 2 };
}

function TrailerModal({ ytKey, title, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', k);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  return (
    <div className="trailer-modal" role="dialog" aria-modal="true" aria-label={`${title} trailer`} onClick={onClose}>
      <div className="trailer-frame" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytKey}?autoplay=1&rel=0`}
          title={`${title} official trailer`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
        <button className="trailer-close" onClick={onClose} aria-label="Close trailer">×</button>
      </div>
    </div>
  );
}

const STONE_COLORS = {
  Space: '#3b82f6', Mind: '#facc15', Reality: '#ef4444', Power: '#a855f7', Time: '#22c55e', Soul: '#f97316',
};

function Countdown({ date }) {
  const days = Math.ceil((new Date(date) - new Date()) / 86400000);
  return <span className="countdown">In theaters in {days} day{days === 1 ? '' : 's'}</span>;
}

function MovieRow({ title, hint, ids, watched, toggle }) {
  const movies = ids.map((id) => byId[id]).filter(Boolean);
  if (!movies.length) return null;
  return (
    <section className="detail-section reveal">
      <h2>{title}</h2>
      {hint && <p className="muted">{hint}</p>}
      <div className="poster-row">
        {movies.map((m) => (
          <PosterCard key={m.id} movie={m} watched={watched.has(m.id)} onToggle={toggle} size="sm" />
        ))}
      </div>
    </section>
  );
}

export default function MovieDetail() {
  const { id } = useParams();
  const movie = byId[id];
  const { watched, toggle } = useWatched();
  const [trailer, setTrailer] = useState(false);
  const [pop, fire] = useJustWatched();
  const [mobileStoryTab, setMobileStoryTab] = useState('story');
  const [storyExpanded, setStoryExpanded] = useState(false);
  const { progress, done: imagesReady } = useHeroImages(movie);
  useReveal([id]);
  useEffect(() => {
    setTrailer(false);
    setStoryExpanded(false);
    setMobileStoryTab('story');
  }, [id]);

  useEffect(() => {
    if (movie) document.title = `${movie.title} · MCU Chronicles`;
    return () => {
      document.title = 'MCU Chronicles';
    };
  }, [movie]);

  if (!movie) return <NotFound />;

  const phase = PHASES[movie.phase];
  const upcoming = isUpcoming(movie);
  const idx = chronological.findIndex((m) => m.id === movie.id);
  const prev = chronological[idx - 1];
  const next = chronological[idx + 1];
  const nextUp = leadsInto(movie.id).map((m) => m.id);
  const related = movie.related.filter((r) => !nextUp.includes(r) && !movie.before.includes(r));
  const missing = movie.before.filter((b) => !watched.has(b));
  const releaseLabel = new Date(movie.release + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const ytKey = TRAILERS[movie.tmdb];
  const isWatched = watched.has(movie.id);

  return (
    <article className={`detail ${imagesReady ? 'loaded' : 'loading'}`} style={{ '--phase': phase.color }}>
      {!imagesReady && <ShieldLoader overlay progress={progress} label="Assembling" />}
      {trailer && ytKey && <TrailerModal ytKey={ytKey} title={movie.title} onClose={() => setTrailer(false)} />}
      <div className="detail-hero">
        <div className="detail-bg" style={{ backgroundImage: `url(${IMG.backdrop(movie.backdrop, 'original')})` }} />
        <div className="detail-shade" />
        <div className="detail-hero-inner">
          <a
            className="detail-poster"
            href={IMG.poster(movie.poster, 'original')}
            target="_blank"
            rel="noreferrer"
            title="Open full-resolution poster"
          >
            <img
              src={IMG.poster(movie.poster, 'w780')}
              srcSet={`${IMG.poster(movie.poster, 'w500')} 500w, ${IMG.poster(movie.poster, 'w780')} 780w, ${IMG.poster(movie.poster, 'original')} 2000w`}
              sizes="(max-width: 700px) 60vw, 340px"
              alt={`${movie.title} poster`}
            />
            {isWatched && (
              <span className={`poster-seal ${pop ? 'pop' : ''}`} aria-label="You have watched this film">
                <CheckIcon size={14} />
                <small>Watched</small>
              </span>
            )}
          </a>
          <div className="detail-info">
            <p className="eyebrow" style={{ color: phase.color }}>
              {phase.name} · {phase.subtitle}
            </p>
            <h1>{movie.title}</h1>
            <p className="tagline">“{movie.tagline}”</p>
            <ul className="facts">
              <li><span>Released</span>{releaseLabel}</li>
              <li><span>Story set</span>{movie.inUniverse}</li>
              <li><span>Runtime</span>{movie.runtime}</li>
              <li><span>Rated</span>{movie.rating}</li>
              <li><span>Director</span>{movie.director}</li>
              <li><span>Story order</span>#{movie.chronoOrder} of {chronological.length}</li>
            </ul>
            {movie.stones.length > 0 && (
              <div className="stones">
                {movie.stones.map((s) => (
                  <span key={s} className="stone" style={{ '--stone': STONE_COLORS[s] }}>
                    <i /> {s} Stone
                  </span>
                ))}
              </div>
            )}
            <div className="detail-actions">
              {upcoming ? (
                <Countdown date={movie.release} />
              ) : (
                <button
                  type="button"
                  className={`btn watch-btn ${isWatched ? 'is-watched' : 'btn-primary'} ${pop ? 'pop' : ''}`}
                  onClick={() => {
                    if (!isWatched) fire();
                    toggle(movie.id);
                  }}
                  aria-pressed={isWatched}
                  title={isWatched ? 'Tap to mark as not watched' : undefined}
                >
                  <span className="wb-icon">{isWatched ? <CheckIcon size={16} /> : <EyeIcon size={17} />}</span>
                  <span className="wb-text">{isWatched ? 'Watched' : 'Mark as watched'}</span>
                  {/* {isWatched && <span className="wb-undo">Undo</span>} */}
                </button>
              )}
              {ytKey && (
                <button className="btn btn-ghost" onClick={() => setTrailer(true)}>
                  ▶ Watch trailer
                </button>
              )}
              <a
                className="btn btn-ghost"
                href={`https://www.themoviedb.org/movie/${movie.tmdb}`}
                target="_blank"
                rel="noreferrer"
              >
                More on TMDB ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-body">
        <section className="detail-section story reveal">
          <div className="story-header">
            <h2>The story</h2>
            {/* Mobile Tab Switcher */}
            <div className="story-mobile-tabs" role="tablist">
              <button
                type="button"
                className={`story-tab-btn ${mobileStoryTab === 'story' ? 'on' : ''}`}
                onClick={() => setMobileStoryTab('story')}
              >
                Synopsis
              </button>
              <button
                type="button"
                className={`story-tab-btn ${mobileStoryTab === 'significance' ? 'on' : ''}`}
                onClick={() => setMobileStoryTab('significance')}
              >
                Why it matters
              </button>
            </div>
          </div>

          <div className={`story-col synopsis-col ${mobileStoryTab === 'story' ? 'active-mobile' : 'hidden-mobile'}`}>
            <div className={`story-text-wrapper ${storyExpanded ? 'expanded' : 'collapsed'}`}>
              <p className="story-text">{movie.story}</p>
              {!storyExpanded && <div className="story-fade-scrim" />}
            </div>
            <button
              type="button"
              className="story-expand-btn"
              onClick={() => setStoryExpanded((prev) => !prev)}
              aria-expanded={storyExpanded}
            >
              <span>{storyExpanded ? 'Show less' : 'Read full briefing'}</span>
              <span className="expand-arrow">{storyExpanded ? '↑' : '↓'}</span>
            </button>
          </div>

          <div className={`story-col callout-col ${mobileStoryTab === 'significance' ? 'active-mobile' : 'hidden-mobile'}`}>
            <div className="callout">
              <h3>Why it matters</h3>
              <p>{movie.significance}</p>
            </div>
          </div>
        </section>

        {movie.before.length > 0 ? (
          <MovieRow
            title="Watch before this"
            hint={
              missing.length
                ? `You still have ${missing.length} of ${movie.before.length} recommended films to watch first.`
                : 'You’re all caught up. Enjoy the movie!'
            }
            ids={movie.before}
            watched={watched}
            toggle={toggle}
          />
        ) : (
          <section className="detail-section reveal">
            <h2>Watch before this</h2>
            <p className="callout ok">No homework needed. This is a great place to jump in.</p>
          </section>
        )}

        {movie.tv?.length > 0 && (
          <section className="detail-section reveal">
            <h2>Recommended series</h2>
            <ul className="tv-list">
              {movie.tv.map((t) => (
                <li key={t}>📺 {t}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="detail-section reveal">
          <h2>Cast &amp; characters</h2>
          <div className="cast-row">
            {movie.cast.map(parseCast).map((c) => (
              <figure key={c.actor + c.character} className="cast-card">
                <img src={IMG.profile(c.img)} alt={c.actor} loading="lazy" />
                <figcaption>
                  <strong>{c.character}</strong>
                  <span>{c.actor}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <MovieRow
          title="Watch next"
          hint="These films pick up threads from this one."
          ids={nextUp}
          watched={watched}
          toggle={toggle}
        />
        <MovieRow title="Also connected" ids={related} watched={watched} toggle={toggle} />

        <nav className="chrono-nav reveal" aria-label="Story order navigation">
          {prev ? (
            <Link to={`/movie/${prev.id}`} className="chrono-link prev">
              <img src={IMG.poster(prev.poster, 'w185')} alt="" />
              <span><small>← Previous in story</small>{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/movie/${next.id}`} className="chrono-link next">
              <span><small>Next in story →</small>{next.title}</span>
              <img src={IMG.poster(next.poster, 'w185')} alt="" />
            </Link>
          ) : <span />}
        </nav>
      </div>
    </article>
  );
}
