import type { EmblemProps } from '@vegaprotocol/emblem';

export function EmblemWithChain(props: EmblemProps) {
  return (
    <img
      src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD"
      alt={props.alt || 'Emblem'}
    />
  );
}
