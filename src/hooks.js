import { useCallback, useEffect, useState } from 'react';

const KEY = 'mcu-watched-v1';

const read = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    return new Set();
  }
};

// Watched list shared across components via a storage event bus.
export function useWatched() {
  const [watched, setWatched] = useState(read);

  useEffect(() => {
    const sync = () => setWatched(read());
    window.addEventListener('mcu-watched', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('mcu-watched', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((id) => {
    const next = read();
    next.has(id) ? next.delete(id) : next.add(id);
    try {
      localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new Event('mcu-watched'));
  }, []);

  return { watched, toggle };
}

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setPrompt(null));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };
  return { canInstall: !!prompt, install };
}

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

// Reveal elements as they scroll into view.
export function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
