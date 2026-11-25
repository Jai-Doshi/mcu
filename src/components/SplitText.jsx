// Splits a line into word (.w) and character (.c) spans with seeded "random" offsets,
// plus a visually-hidden copy for screen readers. Offsets are identical on every load.
function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

export default function SplitText({ text, seed = 7, mode = 'chars', spread = 0.55, em = [], as: Tag = 'span', className = '' }) {
  const r = rng(seed);
  const words = text.split(' ');
  const totalChars = text.replace(/\s/g, '').length;
  let ci = 0;
  return (
    <Tag className={`split ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => {
          const wStyle = { '--th': ((wi / Math.max(1, words.length)) * 0.5).toFixed(3) };
          return [
            <span key={wi} className={`w${em.includes(wi) ? ' em' : ''}`} style={wStyle}>
              {mode === 'chars'
                ? [...w].map((ch, k) => {
                    const ordered = (ci++ / totalChars) * spread;
                    const style = {
                      '--th': (mode === 'chars' ? r() * spread * 0.5 + ordered * 0.5 : 0).toFixed(3),
                      '--jx': `${((r() - 0.5) * 120).toFixed(1)}px`,
                      '--jy': `${((r() - 0.5) * 90).toFixed(1)}px`,
                      '--jr': `${((r() - 0.5) * 70).toFixed(1)}deg`,
                    };
                    return (
                      <span key={k} className="c" style={style}>
                        {ch}
                      </span>
                    );
                  })
                : w}
            </span>,
            wi < words.length - 1 ? ' ' : null,
          ];
        })}
      </span>
    </Tag>
  );
}
