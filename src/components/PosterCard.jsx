import { Link } from 'react-router-dom';
import { IMG, PHASES, isUpcoming } from '../data/movies.js';

export default function PosterCard({ movie, watched, onToggle, size = 'md', showMeta = true }) {
  const phase = PHASES[movie.phase];
  const upcoming = isUpcoming(movie);
  return (
    <div className={`poster-card ${size}`} style={{ '--phase': phase.color }}>
      <Link to={`/movie/${movie.id}`} className="poster-link" aria-label={movie.title}>
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
          {watched && <span className="tag tag-watched">✓ Watched</span>}
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
          className={`watch-toggle ${watched ? 'on' : ''}`}
          onClick={() => onToggle(movie.id)}
          aria-pressed={watched}
          title={watched ? 'Mark as not watched' : 'Mark as watched'}
        >
          {watched ? '✓' : '+'}
        </button>
      )}
    </div>
  );
}
