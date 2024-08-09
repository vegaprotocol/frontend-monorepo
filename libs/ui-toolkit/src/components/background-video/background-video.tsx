import { cn } from '../../utils/cn';

type BackgroundVideoProps = {
  className?: string;
};
export const BackgroundVideo = ({ className }: BackgroundVideoProps) => {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      className={cn(
        'absolute left-0 top-0 w-full h-full object-cover',
        className
      )}
      poster="https://vega.xyz/poster-image.jpg"
    >
      <source
        src="https://d33wubrfki0l68.cloudfront.net/2500bc5ef1b96927e0220eeb2bef0b22b87bcda1/3e0d3/static/moshed-aa65f0933af9abe9afb5e5663c9b3f68.mp4"
        type="video/mp4"
      />
    </video>
  );
};
