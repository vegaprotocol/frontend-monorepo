import { useRef, useEffect, useState } from 'react';

const SERVER_SIDE_DIMENSIONS = {
  width: 1200,
  height: 900,
};

export const useResize = () => {
  const [windowSize, setWindowSize] = useState(
    typeof window !== 'undefined'
      ? {
          width: window.innerWidth,
          height: window.innerHeight,
        }
      : { ...SERVER_SIDE_DIMENSIONS }
  );

  const timeout = useRef(0);

  const handleResize = () => {
    if (timeout.current) {
      window.cancelAnimationFrame(timeout.current);
    }

    // Setup the new requestAnimationFrame()
    timeout.current = window.requestAnimationFrame(function () {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(timeout.current);
    };
  }, []);

  return windowSize;
};
