import { pseudoRandom } from '@vegaprotocol/ui-toolkit';
import { useRef } from 'react';

export const SSRLoader = () => {
  const generateRef = useRef(pseudoRandom(1));
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <style jsx>{`
        @keyframes flickering {
          0% {
            opacity: 1;
          }
          25% {
            opacity: 1;
          }
          26% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
      <div style={{ width: 50, height: 50, display: 'flex', flexWrap: 'wrap' }}>
        {new Array(25).fill(null).map((_, i) => {
          return (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                animation: 'flickering 0.4s linear alternate infinite',
                animationDelay: `-${generateRef.current()}s`,
                animationDirection: i % 2 === 0 ? 'reverse' : 'alternate',
                background: 'black',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
