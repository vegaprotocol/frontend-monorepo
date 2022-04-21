import "./loader.scss";

import React from "react";

interface LoaderProps {
  invert?: boolean;
}

export const Loader = ({ invert = false }: LoaderProps) => {
  const [, forceRender] = React.useState(false);
  const className = ["loader", invert ? "loader--dark" : ""].join(" ");

  React.useEffect(() => {
    const interval = setInterval(() => {
      forceRender((x) => !x);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {new Array(9).fill(null).map((_, i) => {
        return (
          <span
            key={i}
            style={{
              opacity: Math.random() > 0.5 ? 1 : 0,
            }}
          />
        );
      })}
    </span>
  );
};
