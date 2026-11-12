import { useMemo, useState } from 'react';
import { placeholderArt } from '@/utils/placeholder';

interface Props {
  src?: string | null;
  alt: string;
  seed?: string;
  label?: string;
  className?: string;
  eager?: boolean;
}

/** Image with an elegant generated fallback for missing / broken sources. */
const SafeImage = ({ src, alt, seed, label, className = '', eager = false }: Props) => {
  const [failed, setFailed] = useState<string | null>(null);
  const useFallback = !src || failed === src;
  const fallback = useMemo(
    () => (useFallback ? placeholderArt(seed ?? alt, label ?? alt) : ''),
    [useFallback, seed, alt, label],
  );
  return (
    <div className={`media ${className}`}>
      <img
        src={useFallback ? fallback : src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(src ?? null)}
      />
    </div>
  );
};

export default SafeImage;
