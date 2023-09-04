import { useMemo } from 'react';
// import { theme } from '@vegaprotocol/tailwindcss-config';
// import { useResize } from './use-resize';

// export type Screen = keyof typeof theme.screens;

export const useScreenDimensions = () => {
  console.log('useScreenDimensions');
  // const { width } = useResize();
  // const isMobile = width < parseInt(theme.screens.md);
  // const screenSize = Object.entries(theme.screens).reduce(
  //   (agg: Screen, entry) => {
  //     if (width > parseInt(entry[1])) {
  //       agg = entry[0] as Screen;
  //     }
  //     return agg;
  //   },
  //   'xs'
  // );
  return useMemo(
    () => ({
      isMobile: true,
      screenSize: 'lg',
    }),
    []
  );
};
