import { FALLBACK_URL } from '../config/index';
import { cn } from '@vegaprotocol/ui-toolkit';

export type ImgProps = {
  size?: number;
  alt?: string;
  src?: string;
  className?: string;
};

/**
 * Renders an image tag with a known fallback if the emblem does not exist.
 * @param url string the URL of the emblem, probably calculated in EmblemByAsset or EmblemByContract
 * @returns React.Node
 */
export function EmblemBase({ size = 30, ...p }: ImgProps) {
  // If loading the emblem fails, we use a remote fallback image
  const renderFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_URL;
  };

  return (
    <img
      src={p.src || FALLBACK_URL}
      onError={renderFallback}
      alt={p.alt ? p.alt : 'Emblem'}
      width={size}
      height={size}
      className={cn('rounded-full bg-surface-2 border-surface-2', p.className)}
    />
  );
}
