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
            margin: 0;
          }
           html.dark body{
             background: #000;
           }
        `}
      </style>
      <div className="pre-loader">
        <Loader />
      </div>
    </>
  );
};

export default Preloader;
