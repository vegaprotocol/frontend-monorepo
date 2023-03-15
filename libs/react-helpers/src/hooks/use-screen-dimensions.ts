import { useMemo } from 'react';
// @ts-ignore avoid adding declaration file
import { theme } from '@vegaprotocol/tailwindcss-config';
import { useResize } from './use-resize';

export type Screen = keyof typeof theme.screens;

interface Props {
  isMobile: boolean;
  screenSize: Screen;
}

export const useScreenDimensions = (): Props => {
  const { width } = useResize();
  const isMobile = width < parseInt(theme.screens.md);
  const screenSize = Object.entries(theme.screens).reduce(
    (agg: Screen, entry) => {
      if (width > parseInt(entry[1])) {
        agg = entry[0] as Screen;
      }
      return agg;
    },
    'xs'
  );
  return useMemo(
    () => ({
      isMobile,
      screenSize,
    }),
    [isMobile, screenSize]
  );
};
