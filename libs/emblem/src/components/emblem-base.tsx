import type { ImgHTMLAttributes } from 'react';
import { FALLBACK_URL } from '../config/index';

export type ImgProps = ImgHTMLAttributes<HTMLImageElement>;

/**
 * Renders an image tag with a known fallback if the emblem does not exist.
 * @param url string the URL of the emblem, probably calculated in EmblemByAsset or EmblemByContract
 * @returns React.Node
 */
export function EmblemBase(p: ImgProps) {
  const renderFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_URL;
  };

  return (
    <img
      src={p.src || FALLBACK_URL}
      onError={renderFallback}
      alt={p.alt || 'Emblem'}
      width="20"
      height="20"
      className="inline-block w-5 h-5 mx-2 align-text-top"
    />
  );
}
