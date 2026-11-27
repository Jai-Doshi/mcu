import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IMG, PHASES, isUpcoming } from '../data/movies.js';
import { CheckIcon, PlusIcon } from './WatchIcons.jsx';

// Plays a one-off celebration only when the visitor marks a film (never on page load).
export function useJustWatched() {
  const [pop, setPop] = useState(false);
  const t = useRef(null);
  useEffect(() => () => clearTimeout(t.current), []);
  const fire = () => {
    setPop(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setPop(false), 1000);
  };
  return [pop, fire];
}

export default function PosterCard({ movie, watched, onToggle, size = 'md', showMeta = true }) {
  const phase = PHASES[movie.phase];
  const upcoming = isUpcoming(movie);
  const [pop, fire] = useJustWatched();

  const toggle = () => {
    if (!watched) fire();
    onToggle(movie.id);
  };

  return (
    <div
      className={`poster-card ${size} ${watched ? 'is-watched' : ''} ${pop ? 'pop' : ''}`}
      style={{ '--phase': phase.color }}
    >
      <Link to={`/movie/${movie.id}`} className="poster-link" aria-label={`${movie.title}${watched ? ' (watched)' : ''}`}>
        <div className="poster-frame">
          <img
            src={IMG.poster(movie.poster, size === 'sm' ? 'w342' : 'w500')}
            srcSet={`${IMG.poster(movie.poster, 'w342')} 342w, ${IMG.poster(movie.poster, 'w500')} 500w, ${IMG.poster(movie.poster, 'w780')} 780w`}
            sizes={size === 'sm' ? '160px' : '(max-width: 600px) 45vw, 240px'}
            alt={`${movie.title} poster`}
            loading="lazy"
            decoding="async"
          />
          {upcoming && <span className="tag tag-upcoming">Coming soon</span>}
          {watched && (
            <span className="watched-band" aria-hidden="true">
              <CheckIcon size={11} />
              <span>Watched</span>
            </span>
          )}
          <div className="poster-glow" />
        </div>
        {showMeta && (
          <div className="poster-meta">
            <h3>{movie.title}</h3>
            <p>
              {movie.release.slice(0, 4)} · <span style={{ color: phase.color }}>{phase.name}</span>
            </p>
          </div>
        )}
      </Link>
      {onToggle && !upcoming && (
        <button
          type="button"
          className={`watch-toggle ${watched ? 'on' : ''}`}
          onClick={toggle}
          aria-pressed={watched}
          aria-label={watched ? `Mark ${movie.title} as not watched` : `Mark ${movie.title} as watched`}
          title={watched ? 'Watched · tap to undo' : 'Mark as watched'}
        >
          {watched ? <CheckIcon size={14} /> : <PlusIcon size={14} />}
        </button>
      )}
    </div>
  );
}
