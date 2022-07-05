import React from 'react';
import classNames from 'classnames';

interface Props {
  width: number;
  height: number;
  className: string;
}

const Video = ({ width = 60, height = 60, className = '' }: Partial<Props>) => {
  return (
    <video
      width={width}
      height={height}
      autoPlay
      muted
      loop
      playsInline
      className={classNames(
        'absolute left-0 top-0 w-full h-full object-cover',
        className
      )}
      poster="https://vega.xyz/static/poster-image.jpg"
    >
      <source
        src="https://d33wubrfki0l68.cloudfront.net/2500bc5ef1b96927e0220eeb2bef0b22b87bcda1/3e0d3/static/moshed-aa65f0933af9abe9afb5e5663c9b3f68.mp4"
        type="video/mp4"
      />
    </video>
  );
};

export default Video;
