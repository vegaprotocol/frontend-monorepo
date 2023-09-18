import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

export const Dude = ({ className }: HTMLAttributes<SVGElement>) => {
  return (
    <svg
      width="41"
      height="47"
      viewBox="0 0 41 47"
      fill="none"
      className={className}
    >
      <path
        d="M21.1895 0.298767L5.08827 27.4101L8.96133 29.7103L4.36099 37.4564L8.23404 39.7566L12.8344 32.0105L16.7074 34.3107L12.1071 42.0568L15.9801 44.3569L20.5805 36.6108L24.4535 38.911L40.5547 11.7996L21.1895 0.298767Z"
        className="fill-black dark:fill-white"
      />
      <path
        d="M35.9346 15.1683L20.4424 5.96765L14.3086 16.2958L29.8008 25.4965L35.9346 15.1683Z"
        className="fill-white dark:fill-black"
      />
      <path
        d="M25.646 17.7895L23.064 16.2561L21.5305 18.8381L24.1126 20.3716L25.646 17.7895Z"
        className="fill-black dark:fill-white"
      />
      <path
        d="M29.7612 16.7412L27.1792 15.2077L25.6458 17.7898L28.2278 19.3232L29.7612 16.7412Z"
        className="fill-black dark:fill-white"
      />
      <path
        d="M33.877 15.6925L31.2949 14.159L29.7615 16.7411L32.3435 18.2745L33.877 15.6925Z"
        className="fill-black dark:fill-white"
      />
      <path
        d="M29.0342 26.7874L26.4521 25.2539L24.9187 27.836L27.5007 29.3694L29.0342 26.7874Z"
        fill="#FF077F"
      />
    </svg>
  );
};

export const Wire = ({ className }: HTMLAttributes<SVGElement>) => {
  return (
    <svg
      width="157"
      height="88"
      viewBox="0 0 157 88"
      fill="none"
      className={className}
    >
      <path
        d="M109.398 6.12235C127.37 -3.81898 146.791 1.45045 153.465 14.307C160.138 27.1636 154.195 43.9948 140.438 52.1164C126.68 60.238 105.767 54.9998 84.9212 43.464C64.0752 31.9281 32.2412 6.42016 18.8175 24.185C6.90871 40.719 41.9332 68.4495 29.2664 82.7049C23.187 88.4974 11.1379 88.2645 0.968295 80.3398"
        className="stroke-black dark:stroke-white"
        strokeWidth="1.5"
        strokeMiterlimit="10"
      />
    </svg>
  );
};

export const AnimatedDudeWithWire = ({ className }: { className?: string }) => (
  <div className="relative">
    <Wire className="absolute top-[25px]" />
    <Dude
      className={classNames(
        'absolute left-[96px] animate-[wave_20s_ease-in-out_infinite]',
        className
      )}
    />
  </div>
);
