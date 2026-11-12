import type Lenis from 'lenis';

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const scrollToTop = () => {
  if (instance) instance.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
};

export const pauseScroll = () => instance?.stop();
export const resumeScroll = () => instance?.start();
