import classNames from 'classnames';
import styles from './loader.module.scss';

export const pseudoRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 1000000000;
  };
};

const generate = pseudoRandom(1);

export interface LoaderProps {
  size?: 'small' | 'large';
  forceTheme?: 'dark' | 'light';
}

export const Loader = ({ size = 'large', forceTheme }: LoaderProps) => {
  const itemClasses = classNames('loader-item', styles['loader-item'], {
    'dark:bg-white bg-black': !forceTheme,
    'bg-white': forceTheme === 'dark',
    'bg-black': forceTheme === 'light',
    'w-[10px] h-[10px]': size === 'large',
    'w-[5px] h-[5px]': size === 'small',
  });
  const wrapperClasses =
    size === 'small' ? 'w-[15px] h-[15px]' : 'w-[50px] h-[50px]';
  const items = size === 'small' ? 9 : 25;

  return (
    <div className="flex flex-col items-center" data-testid="loader">
      <div className={`${wrapperClasses} flex flex-wrap`}>
        {new Array(items).fill(null).map((_, i) => {
          return (
            <div
              className={itemClasses}
              key={i}
              style={{
                opacity: generate() > 1.5 ? 1 : 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
