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
    <span className="flex flex-wrap w-[15px] h-[15px]">
      {new Array(9).fill(null).map((_, i) => {
        return (
          <span
            key={i}
            className="block w-[5px] h-[5px] bg-black dark:bg-white"
            style={{
              opacity: Math.random() > 0.5 ? 1 : 0,
            }}
          />
        );
      })}
    </span>
  );
};
