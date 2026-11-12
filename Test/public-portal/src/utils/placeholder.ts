/**
 * Elegant, dependency-free fallback artwork (inline SVG data URI).
 * Used whenever an item has no image or an image fails to load.
 */
const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const placeholderArt = (seed: string, label = ''): string => {
  const h = hash(seed || 'x');
  const hue = 28 + (h % 40); // warm copper range
  const a = `hsl(${hue} 38% 22%)`;
  const b = `hsl(${hue + 12} 30% 9%)`;
  const glow = `hsl(${hue} 70% 62%)`;
  const cx = 30 + (h % 40);
  const cy = 28 + ((h >> 5) % 30);
  const r = 90 + ((h >> 9) % 70);
  const text = label
    ? `<text x="50%" y="92%" text-anchor="middle" font-family="sans-serif" font-size="22" letter-spacing="6" fill="rgba(255,255,255,.28)">${label
        .toUpperCase()
        .slice(0, 22)
        .replace(/[<>&"']/g, '')}</text>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><radialGradient id="r" cx="${cx}%" cy="${cy}%" r="60%"><stop offset="0" stop-color="${glow}" stop-opacity=".35"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient></defs><rect width="800" height="600" fill="url(#g)"/><rect width="800" height="600" fill="url(#r)"/><g fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.5"><circle cx="${cx * 8}" cy="${cy * 6}" r="${r}"/><circle cx="${cx * 8}" cy="${cy * 6}" r="${r * 1.7}"/><circle cx="${cx * 8}" cy="${cy * 6}" r="${r * 2.5}"/></g><rect x="${(h % 300) + 120}" y="${((h >> 3) % 160) + 120}" width="170" height="170" rx="18" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.18)" transform="rotate(${(h % 30) - 15} 400 300)"/>${text}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
