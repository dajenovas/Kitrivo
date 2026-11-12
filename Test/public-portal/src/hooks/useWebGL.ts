let cached: boolean | null = null;

/** One-time WebGL capability check so 3D can fall back to static imagery. */
export const hasWebGL = (): boolean => {
  if (cached !== null) return cached;
  try {
    const c = document.createElement('canvas');
    cached = Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    cached = false;
  }
  return cached;
};
