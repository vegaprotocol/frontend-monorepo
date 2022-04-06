import { useEffect, useState } from 'react';

interface LoaderProps {
  size?: 'small' | 'large';
}

export const Loader = ({ size = 'large' }: LoaderProps) => {
  const [, forceRender] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      forceRender((x) => !x);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const wrapperClasses = size === 'small' ? 'w-[15px] h-[15px]' : 'w-64 h-64';
  const gridItemClasses = size === 'small' ? 'w-[5px] h-[5px]' : 'w-16 h-16';
  const items = size === 'small' ? 9 : 16;

  return (
    <div className="flex flex-col items-center" data-testid="splash-loader">
      <div className={`${wrapperClasses} flex flex-wrap`}>
        {new Array(items).fill(null).map((_, i) => {
          return (
            <div
              className={`${gridItemClasses} dark:bg-white bg-black`}
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
