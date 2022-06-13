import classNames from 'classnames';
import { useEffect, useState } from 'react';

interface LoaderProps {
  size?: 'small' | 'large';
  forceTheme?: 'dark' | 'light';
}

export const Loader = ({ size = 'large', forceTheme }: LoaderProps) => {
  const [, forceRender] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      forceRender((x) => !x);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const itemClasses = classNames({
    'dark:bg-white bg-black': !forceTheme,
    'bg-white': forceTheme === 'dark',
    'bg-black': forceTheme === 'light',
    'w-16 h-16': size === 'large',
    'w-[5px] h-[5px]': size === 'small',
  });
  const wrapperClasses = size === 'small' ? 'w-[15px] h-[15px]' : 'w-64 h-64';
  const items = size === 'small' ? 9 : 16;

  return (
    <div className="flex flex-col items-center" data-testid="loader">
      <div className={`${wrapperClasses} flex flex-wrap`}>
        {new Array(items).fill(null).map((_, i) => {
          return (
            <div
              className={itemClasses}
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
