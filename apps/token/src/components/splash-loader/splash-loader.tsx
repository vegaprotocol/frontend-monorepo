import React from 'react';

export const SplashLoader = ({ text = 'Loading' }: { text?: string }) => {
  const [, forceRender] = React.useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => {
      forceRender((x) => !x);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center" data-testid="splash-loader">
      <div className="flex flex-wrap w-[50px] h-[50px] mb-20">
        {new Array(25).fill(null).map((_, i) => {
          return (
            <div
              key={i}
              className="w-[10px] h-[10px] bg-white opacity-0"
              style={{
                opacity: Math.random() > 0.75 ? 1 : 0,
              }}
            />
          );
        })}
      </div>
      <div>{text}</div>
    </div>
  );
};
