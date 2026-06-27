/** Fan out markers that share (almost) the same coordinate so none are hidden.
 *  Returns display coords (same order); non-overlapping points are unchanged. */
export function spread(
  coords: [number, number][],
  radiusDeg = 0.6,
): [number, number][] {
  const groups = new Map<string, number[]>();
  coords.forEach((c, i) => {
    const k = `${c[0].toFixed(1)},${c[1].toFixed(1)}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(i);
  });
  const out = coords.map((c) => [c[0], c[1]] as [number, number]);
  groups.forEach((idxs) => {
    if (idxs.length > 1) {
      idxs.forEach((idx, j) => {
        const ang = (2 * Math.PI * j) / idxs.length - Math.PI / 2;
        out[idx] = [
          coords[idx][0] + Math.sin(ang) * radiusDeg,
          coords[idx][1] + Math.cos(ang) * radiusDeg,
        ];
      });
    }
  });
  return out;
}

/** quadratic-bezier arc between two [lat,lon] points (for curved flow lines) */
export function arc(
  a: [number, number],
  b: [number, number],
  bend = 0.18,
): [number, number][] {
  const [y1, x1] = a;
  const [y2, x2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const off = bend * dist;
  const cx = (x1 + x2) / 2 - (dy / dist) * off;
  const cy = (y1 + y2) / 2 + (dx / dist) * off;
  const pts: [number, number][] = [];
  for (let t = 0; t <= 1.0001; t += 0.04) {
    const u = 1 - t;
    pts.push([
      u * u * y1 + 2 * u * t * cy + t * t * y2,
      u * u * x1 + 2 * u * t * cx + t * t * x2,
    ]);
  }
  return pts;
}
