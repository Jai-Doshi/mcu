import { useEffect, useRef, useState } from 'react';
import { PHASES } from '../data/movies.js';

// Themed phase picker (replaces the native <select>, whose option list the OS draws unstyled).
// Keyboard: Enter/Space/ArrowDown opens, arrows move, Enter picks, Escape closes.
const OPTIONS = [
  { value: 0, name: 'All Phases', subtitle: 'Every film', color: 'var(--arc)' },
  ...Object.entries(PHASES).map(([n, p]) => ({ value: +n, name: p.name, subtitle: p.subtitle, color: p.color })),
];

export default function PhaseDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const current = OPTIONS.find((o) => o.value === value) || OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, OPTIONS.findIndex((o) => o.value === value)));
    const away = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open, value]);

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const pick = (v) => {
    onChange(v);
    setOpen(false);
    rootRef.current?.querySelector('.pd-trigger')?.focus();
  };

  const onKey = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(OPTIONS.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(OPTIONS[active].value);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className={`phase-dropdown ${open ? 'open' : ''}`} ref={rootRef} onKeyDown={onKey}>
      <button
        type="button"
        className="pd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Filter by phase: ${current.name}`}
        onClick={() => setOpen((o) => !o)}
        style={{ '--dot': current.color }}
      >
        <span className="pd-dot" aria-hidden="true" />
        <span className="pd-label">
          <strong>{current.name}</strong>
          <small>{current.subtitle}</small>
        </span>
        <svg className="pd-chevron" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="pd-list" role="listbox" ref={listRef} aria-label="Phases">
          {OPTIONS.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`pd-option ${i === active ? 'active' : ''} ${o.value === value ? 'selected' : ''}`}
              style={{ '--dot': o.color }}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(o.value)}
            >
              <span className="pd-dot" aria-hidden="true" />
              <span className="pd-label">
                <strong>{o.name}</strong>
                <small>{o.subtitle}</small>
              </span>
              {o.value === value && <span className="pd-check" aria-hidden="true">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
