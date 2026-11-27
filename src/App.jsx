import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import Vault from './pages/Vault.jsx';
import StrangeSplash from './components/StrangeSplash.jsx';
import BottomNav from './components/BottomNav.jsx';
import { useInstallPrompt, useOnline } from './hooks.js';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const prevPath = useRef(pathname);
  useEffect(() => {
    const from = prevPath.current;
    prevPath.current = pathname;
    // opening/closing a suit showcase keeps the vault's scroll position
    if (from !== pathname && from.startsWith('/vault') && pathname.startsWith('/vault')) return;
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

// Pause every looping animation while the tab is hidden.
function usePauseWhenHidden() {
  useEffect(() => {
    const on = () => document.body.classList.toggle('paused', document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
}

export default function App() {
  const { canInstall, install } = useInstallPrompt();
  const online = useOnline();
  const [ready, setReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  usePauseWhenHidden();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <StrangeSplash onDone={() => setReady(true)} />
      <div className="env" aria-hidden="true">
        <span className="env-glow g1" />
        <span className="env-glow g2" />
        <span className="env-grain" />
      </div>
      <ScrollToTop />
      <header className={`topbar ${scrolled ? 'solid' : ''}`}>
        <Link to="/" className="brand" aria-label="MCU Chronicles home">
          <span className="brand-badge">MCU</span>
          <span className="brand-text">Chronicles</span>
        </Link>
        <nav className="topnav" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <Link to="/#saga">Story</Link>
          <Link to="/#timeline">Timeline</Link>
          <NavLink to="/vault">Suit Vault</NavLink>
          {canInstall && (
            <button className="btn btn-install" onClick={install}>Install app</button>
          )}
        </nav>
      </header>
      {!online && <div className="offline">You are offline. Showing saved content.</div>}
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home ready={ready} />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/vault/:suitId" element={<Vault />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <BottomNav />
      <footer className="footer">
        <p>
          A fan-made guide to the Marvel Cinematic Universe. Posters, images and cast data come from{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">TMDB</a>. The hero footage is AI
          generated fan art. Not affiliated with Marvel Studios or Disney.
        </p>
      </footer>
    </>
  );
}
