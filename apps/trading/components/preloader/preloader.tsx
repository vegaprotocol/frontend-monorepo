import { Loader } from '@vegaprotocol/ui-toolkit';

export const Preloader = () => {
  return (
    <>
      <style>
        {`
          body{
            display: block;
            width: 100%;
            height: 100%;
          }
        `}
      </style>
      <div className="pre-loader">
        <Loader forceTheme="light" preloader />
      </div>
    </>
  );
};

export default Preloader;
