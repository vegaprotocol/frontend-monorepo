import { Loader } from '@vegaprotocol/ui-toolkit';

export const Preloader = () => {
  let str = '';
  Array(16)
    .fill(null)
    .map((_, i) => {
      str += `.loader-item:nth-child(${i}) {
          animation-delay: ${i % 2 === 0 ? i * 250 : i * -250}ms;
          animation-direction: ${i % 2 === 0 ? 'reverse' : 'alternate'};
        }
        `;
    });

  return (
    <>
      <style>
        {`
          body{
            display: block;
            width: 100%;
            height: 100%;
          }
          ${str}
        `}
      </style>
      <div className="pre-loader">
        <Loader forceTheme="light" />
      </div>
    </>
  );
};

export default Preloader;
