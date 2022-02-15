import "./splash-loader.scss";

import React from "react";

export const SplashLoader = ({ text = "Loading" }: { text?: string }) => {
  const [, forceRender] = React.useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => {
      forceRender((x) => !x);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading" data-testid="splash-loader">
      <div className="loading__animation">
        {new Array(25).fill(null).map((_, i) => {
          return (
            <div
              key={i}
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
