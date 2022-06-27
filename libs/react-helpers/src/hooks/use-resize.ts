import { useRef, useEffect, useState } from 'react';

export const useResize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
