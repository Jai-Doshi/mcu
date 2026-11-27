import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SuitShowcase from '../components/SuitShowcase.jsx';
import { HEROES, RANKS, SUITS, filmOf, heroById, suitsFor } from '../data/suits.js';
import { useWatched } from '../hooks.js';
import { CheckIcon } from '../components/WatchIcons.jsx';

// Suits the visitor has already seen unlocked; anything newly unlocked gets a one-time reveal.
const SEEN_KEY = 'mcu-vault-seen-v1';
const readSeen = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

function LockIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function SuitCard({ suit, unlocked, isNew, onOpen }) {
  const hero = heroById[suit.hero];
  const film = filmOf(suit);
  return (
    <button
      type="button"
      className={`suit-card ${unlocked ? 'unlocked' : 'locked'} ${isNew ? 'is-new' : ''}`}
      style={{ '--hero': hero.color }}
      onClick={() => onOpen(suit)}
      aria-label={unlocked ? `${hero.name}: ${suit.name}, unlocked` : `${hero.name}: ${suit.name}, locked. Watch ${film.title} to unlock.`}
    >
      <span className="sc-level">LV {suit.level}</span>
      {isNew && <span className="sc-new">New</span>}
      <span className="sc-art">
        <img
          src={suit.img}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(e) => e.currentTarget.classList.add('missing')}
        />
        {!unlocked && (
          <span className="sc-lock">
            <LockIcon size={18} />
          </span>
        )}
      </span>
      <span className="sc-info">
        <strong>{unlocked ? suit.name : 'Classified'}</strong>
        <small>{unlocked ? film.title : `Watch ${film.title}`}</small>
      </span>
    </button>
  );
}

function SuitModal({ suit, unlocked, onClose }) {
  const hero = heroById[suit.hero];
  const film = filmOf(suit);
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
    <div className="suit-modal" role="dialog" aria-modal="true" aria-label={`${hero.name} ${suit.name}`} onClick={onClose}>
      <div className={`sm-panel ${unlocked ? 'unlocked' : 'locked'}`} style={{ '--hero': hero.color }} onClick={(e) => e.stopPropagation()}>
        <button className="sm-close" onClick={onClose} aria-label="Close">×</button>
        <div className="sm-art">
          <img src={suit.img} alt={unlocked ? `${suit.name} suit` : 'Locked suit silhouette'} />
          {!unlocked && <span className="sc-lock big"><LockIcon size={28} /></span>}
        </div>
        <div className="sm-info">
          <p className="eyebrow" style={{ color: hero.color }}>
            {hero.name} · Level {suit.level} of {suitsFor(suit.hero).length}
          </p>
          <h2>{unlocked ? suit.name : 'Classified suit'}</h2>
          <p className="sm-blurb">
            {unlocked ? suit.blurb : `This suit is still locked. Watch ${film.title} and mark it as watched to add it to your vault.`}
          </p>
          <div className="sm-film">
            <span className="mono">{unlocked ? 'Unlocked by' : 'Unlock with'}</span>
            <Link to={`/movie/${film.id}`} className="btn btn-ghost">
              {film.title} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Vault() {
  const { watched } = useWatched();
  const { suitId } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null); // locked-suit modal
  const [seen] = useState(readSeen);

  const isUnlocked = (s) => watched.has(s.film);
  const showcased = suitId ? SUITS.find((s) => s.id === suitId) : null;
  const showcaseOk = showcased && isUnlocked(showcased);

  // a locked or unknown suit in the URL goes back to the vault
  useEffect(() => {
    if (suitId && !showcaseOk) navigate('/vault', { replace: true });
  }, [suitId, showcaseOk, navigate]);

  const openSuit = (s) => (isUnlocked(s) ? navigate(`/vault/${s.id}`) : setOpen(s));
  const closeShowcase = () => {
    // go back if we came from the vault, so the browser/phone back button stays natural
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/vault', { replace: true });
  };
  const unlockedCount = SUITS.filter(isUnlocked).length;
  const pct = Math.round((unlockedCount / SUITS.length) * 100);
  const rank = [...RANKS].reverse().find((r) => unlockedCount >= r.min);
  const nextRank = RANKS.find((r) => r.min > unlockedCount);
  const newIds = useMemo(() => new Set(SUITS.filter((s) => watched.has(s.film) && !seen.has(s.id)).map((s) => s.id)), [watched, seen]);

  // next suit to unlock: the earliest-released locked suit's film
  const nextSuit = SUITS.filter((s) => !isUnlocked(s)).sort((a, b) => filmOf(a).release.localeCompare(filmOf(b).release))[0];

  useEffect(() => {
    document.title = 'Suit Vault · MCU Chronicles';
    // remember what's unlocked now so the "new" reveal plays only once
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(SUITS.filter((s) => watched.has(s.film)).map((s) => s.id)));
    } catch {
      /* ignore */
    }
    return () => {
      document.title = 'MCU Chronicles';
    };
  }, [watched]);

  const heroes = HEROES.map((h) => {
    const suits = suitsFor(h.id);
    const got = suits.filter(isUnlocked).length;
    return { ...h, suits, got };
  }).filter((h) => (filter === 'unlocked' ? h.got > 0 : filter === 'locked' ? h.got < h.suits.length : true));

  return (
    <div className="vault">
      <header className="vault-head">
        <p className="eyebrow">Your collection</p>
        <h1>Suit Vault</h1>
        <p className="muted vault-lede">
          Every film you watch unlocks the suits that debut in it. Level up each hero, one movie at a time.
        </p>

        <div className="vault-rank" style={{ '--pct': pct }}>
          <div className="vr-ring" aria-hidden="true">
            <span>{pct}%</span>
          </div>
          <div className="vr-text">
            <span className="mono">Rank</span>
            <strong>{rank.title}</strong>
            <span className="vr-count">
              {unlockedCount} of {SUITS.length} suits unlocked
              {nextRank ? ` · ${nextRank.min - unlockedCount} more to ${nextRank.title}` : ''}
            </span>
          </div>
          {nextSuit && (
            <Link to={`/movie/${nextSuit.film}`} className="vr-next" style={{ '--hero': heroById[nextSuit.hero].color }}>
              <img src={nextSuit.img} alt="" />
              <span>
                <small className="mono">Next unlock</small>
                <b>Watch {filmOf(nextSuit).title}</b>
              </span>
            </Link>
          )}
        </div>

        <div className="vault-filter segmented" role="tablist" aria-label="Filter suits">
          {[
            ['all', 'All'],
            ['unlocked', 'Unlocked'],
            ['locked', 'Locked'],
          ].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>
              {l}
            </button>
          ))}
        </div>
      </header>

      {heroes.length === 0 && <p className="empty">Nothing here yet. Mark a film as watched to unlock your first suit.</p>}

      {heroes.map((h) => (
        <section key={h.id} className="hero-row" style={{ '--hero': h.color }} aria-label={h.name}>
          <div className="hr-head">
            <h2>{h.name}</h2>
            <span className="hr-level mono">
              LV {h.got}/{h.suits.length}
            </span>
            <span className="hr-pips" aria-hidden="true">
              {h.suits.map((s) => (
                <i key={s.id} className={isUnlocked(s) ? 'on' : ''} />
              ))}
            </span>
            {h.got === h.suits.length && (
              <span className="hr-complete">
                <CheckIcon size={11} /> Complete
              </span>
            )}
          </div>
          <div className="hr-suits">
            {h.suits
              .filter((s) => (filter === 'unlocked' ? isUnlocked(s) : filter === 'locked' ? !isUnlocked(s) : true))
              .map((s) => (
                <SuitCard key={s.id} suit={s} unlocked={isUnlocked(s)} isNew={newIds.has(s.id)} onOpen={openSuit} />
              ))}
          </div>
        </section>
      ))}

      <p className="vault-note muted">
        Suit art is original AI-generated fan design inspired by each hero, not official Marvel artwork.
      </p>

      {open && <SuitModal suit={open} unlocked={isUnlocked(open)} onClose={() => setOpen(null)} />}
      {showcaseOk && (
        <SuitShowcase
          suit={showcased}
          isUnlocked={isUnlocked}
          onClose={closeShowcase}
          onSelect={(id) => navigate(`/vault/${id}`, { replace: true })}
        />
      )}
    </div>
  );
}
