import { useMemo } from 'react';
import { theme } from '@vegaprotocol/tailwindcss-config';
import { useResize } from './use-resize';

type Screen = keyof typeof theme.screens;

interface Props {
  isMobile: boolean;
  screen: Screen;
  width: number;
}

export const useScreenDimensions = (): Props => {
  const { width } = useResize();
  return useMemo(
    () => ({
      width,
      isMobile: width < parseInt(theme.screens.md),
      screen: Object.entries(theme.screens).reduce((agg: Screen, entry) => {
        if (width > parseInt(entry[1])) {
          agg = entry[0] as Screen;
        }
        return agg;
      }, 'xs'),
    }),
    [width]
  );
};
