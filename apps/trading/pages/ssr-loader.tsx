import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

/**
 * Loader component to be rendered at build time and served in the initial
 * html. Use inline styles to ensure loader shows ASAP */
export const SSRLoader = () => {
  const size = 32;
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        stroke: 'black',
      }}
    >
      <style jsx>{`
        @keyframes ssr-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div
        style={{
          width: size,
          height: size,
          animation: 'ssr-spin 1s linear infinite',
        }}
      >
        <VegaIcon name={VegaIconNames.LOADING} size={size} />
      </div>
    </div>
  );
};
