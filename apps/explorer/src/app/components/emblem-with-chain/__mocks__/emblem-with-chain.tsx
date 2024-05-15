import type { EmblemProps } from '@vegaprotocol/emblem';

export function EmblemWithChain(props: EmblemProps) {
  return (
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
      alt={props.alt || 'Emblem'}
    />
  );
}
