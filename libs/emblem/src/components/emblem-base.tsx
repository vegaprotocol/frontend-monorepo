import { useState, type ImgHTMLAttributes } from 'react';
import { FALLBACK_URL } from '../config/index';

export type ImgProps = ImgHTMLAttributes<HTMLImageElement>;

/**
 * Renders an image tag with a known fallback if the emblem does not exist.
 * @param url string the URL of the emblem, probably calculated in EmblemByAsset or EmblemByContract
 * @returns React.Node
 */
export function EmblemBase(p: ImgProps) {
  // Used to render a holding image while the emblem is loading
  const [loading, setLoading] = useState(true);

  // If loading the emblem fails, we use a remote fallback image
  const renderFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_URL;
  };

  return (
    <>
      <span style={{ display: loading ? 'inline-block' : 'none' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42">
          <rect width="42" height="42" rx="21" />
        </svg>
      </span>
      <img
        src={p.src || FALLBACK_URL}
        onError={renderFallback}
        alt={p.alt || 'Emblem'}
        width="30"
        height="30"
        className={`${p.className} h-inherit`}
        onLoad={() => setLoading(false)}
      />
    </>
  );
}
