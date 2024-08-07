import { useLayoutEffect, useMemo } from 'react';

import { CONSTANTS } from '../../lib/constants';

export const usePreventWindowResize = () => {
  const frameHeight = useMemo(
    () => window.outerHeight - window.innerHeight,
    []
  );
  useLayoutEffect(() => {
    function resetSize() {
      window.resizeTo(
        CONSTANTS.width,
        Math.max(window.outerHeight, CONSTANTS.defaultHeight + frameHeight)
      );
    }
    window.addEventListener('resize', resetSize);
    resetSize();
    return () => window.removeEventListener('resize', resetSize);
  }, [frameHeight]);
};
