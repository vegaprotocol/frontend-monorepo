import { type SVGAttributes } from 'react';
import { EmblemSvg } from '../emblem-svg';

export const NaturalGas = (props: SVGAttributes<SVGElement>) => {
  return (
    <EmblemSvg {...props} viewBox="0 0 1024 1024">
      <path
        d="M512 512m-480 0a480 480 0 1 0 960 0 480 480 0 1 0-960 0Z"
        fill="#FEE8EB"
      />
      <path
        d="M601.6 473.6c-57.6-64-57.6-140.8-57.6-249.6-179.2 70.4-134.4 262.4-140.8 326.4-44.8-38.4-57.6-128-57.6-128C294.4 448 268.8 512 268.8 563.2c0 128 108.8 236.8 243.2 236.8s243.2-102.4 243.2-236.8c0-76.8-57.6-115.2-57.6-217.6-83.2 25.6-96 89.6-96 128z"
        fill="#FF6B6A"
      />
      <path
        d="M505.6 537.6c83.2 32 64 121.6 64 147.2 19.2-19.2 25.6-57.6 25.6-57.6 19.2 12.8 32 38.4 32 64 0 57.6-51.2 108.8-108.8 108.8s-108.8-51.2-108.8-108.8c6.4-57.6 96-102.4 96-153.6z"
        fill="#FFA9B1"
      />
    </EmblemSvg>
  );
};
