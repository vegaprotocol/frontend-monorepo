import React from 'react';

interface LoaderProps {
  invert?: boolean;
}

export const Loader = ({ invert = false }: LoaderProps) => {
  const [, forceRender] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      forceRender((x) => !x);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="flex flex-row flex-wrap w-[15px] h-[15px]">
      {new Array(9).fill(null).map((_, i) => {
        return (
          <span
            key={i}
            style={{
              opacity: Math.random() > 0.5 ? 1 : 0,
            }}
            className={`block w-5 h-5 opacity-0 ${
              invert ? 'bg-black' : 'bg-white'
            }`}
          />
        );
      })}
    </span>
  );
};
