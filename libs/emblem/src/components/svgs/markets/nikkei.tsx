import { type SVGAttributes } from 'react';
import { EmblemSvg } from '../emblem-svg';

export const Nikkei = (props: SVGAttributes<SVGElement>) => {
  return (
    <EmblemSvg {...props} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#f5f5f5"></circle>
      <circle cx="32" cy="32" r="12" fill="#ed4c5c"></circle>
    </EmblemSvg>
  );
};
