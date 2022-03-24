import { useEffect, useState } from 'react';

export const Loader = () => {
  const [, forceRender] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      forceRender((x) => !x);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center" data-testid="splash-loader">
      <div className="w-64 h-64 flex flex-wrap">
        {new Array(16).fill(null).map((_, i) => {
          return (
            <div
              className="w-16 h-16 dark:bg-white bg-black"
              key={i}
              style={{
                opacity: Math.random() > 0.75 ? 1 : 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
