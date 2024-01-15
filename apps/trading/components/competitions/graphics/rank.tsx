import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import classNames from 'classnames';

export const Rank = ({
  variant,
  className,
}: {
  variant?: 'gold' | 'silver' | 'bronze';
  className?: classNames.Argument;
}) => {
  const { theme } = useThemeSwitcher();
  return (
    <div
      title={classNames({
        '1': variant === 'gold',
        '2': variant === 'silver',
        '3': variant === 'bronze',
      })}
      className={classNames(
        {
          'text-yellow-300': variant === 'gold',
          'text-vega-clight-500': variant === 'silver',
          'text-vega-orange-500': variant === 'bronze',
          'text-black dark:text-white': variant === undefined,
        },
        className
      )}
    >
      <svg width="18" height="30" viewBox="0 0 18 30" fill="none">
        <defs>
          <linearGradient x1="0" y1="0" x2="100%" y2="100%" id="medal">
            <stop offset="33%" stop-color="transparent" />
            <stop offset="100%" stop-color="black" stop-opacity="50%" />
          </linearGradient>
          <clipPath id="shape">
            <path d="M2 2H4V4H2V2Z" />
            <path d="M2 2H4V4H2V2Z" />
            <path d="M2 2H6V4H2V2Z" />
            <path d="M2 2H6V4H2V2Z" />
            <path d="M0 4H4V6H0V4Z" />
            <path d="M0 4H4V6H0V4Z" />
            <path d="M4 0H14V2H4V0Z" />
            <path d="M4 0H14V2H4V0Z" />
            <path d="M0 14V4H2V14H0Z" />
            <path d="M0 14V4H2V14H0Z" />
            <path d="M2 30L2 18H4L4 30H2Z" />
            <path d="M2 30L2 18H4L4 30H2Z" />
            <path d="M14 30L14 18H16L16 30H14Z" />
            <path d="M14 30L14 18H16L16 30H14Z" />
            <path d="M16 14L16 4H18V14H16Z" />
            <path d="M16 14L16 4H18V14H16Z" />
            <path d="M2 6V2H4V6H2Z" />
            <path d="M2 6V2H4V6H2Z" />
            <path d="M16 2V6H14V2H16Z" />
            <path d="M16 2V6H14V2H16Z" />
            <path d="M12 2H16L16 4H12V2Z" />
            <path d="M12 2H16L16 4H12V2Z" />
            <path d="M14 4H18V6H14V4Z" />
            <path d="M14 4H18V6H14V4Z" />
            <path d="M16 16H12V14H16V16Z" />
            <path d="M16 16H12V14H16V16Z" />
            <path d="M14 18H4L4 16L14 16L14 18Z" />
            <path d="M14 18H4L4 16L14 16L14 18Z" />
            <path d="M16 12V16H14V12H16Z" />
            <path d="M16 12V16H14V12H16Z" />
            <path d="M6 16H2V14H6V16Z" />
            <path d="M6 16H2V14H6V16Z" />
            <path d="M6 28H4L4 26H6V28Z" />
            <path d="M6 28H4L4 26H6V28Z" />
            <path d="M8 26H6L6 24H8V26Z" />
            <path d="M8 26H6L6 24H8V26Z" />
            <path d="M10 24H8V22H10V24Z" />
            <path d="M10 24H8V22H10V24Z" />
            <path d="M12 26H10L10 24H12V26Z" />
            <path d="M12 26H10L10 24H12V26Z" />
            <path d="M14 28H12L12 26H14V28Z" />
            <path d="M14 28H12L12 26H14V28Z" />
            <path d="M4 14H0L2.04189e-07 12H4V14Z" />
            <path d="M4 14H0L2.04189e-07 12H4V14Z" />
            <path d="M6 4H12V14H6V4Z" />
            <path d="M6 4H12V14H6V4Z" />
            <path d="M4 6H14V12H4V6Z" />
            <path d="M4 6H14V12H4V6Z" />
          </clipPath>
        </defs>
        <rect
          rx="0"
          ry="0"
          width="18"
          height="30"
          fill="currentColor"
          clipPath="url(#shape)"
        />
        <rect
          rx="0"
          ry="0"
          width="18"
          height="30"
          fill="url(#medal)"
          clipPath="url(#shape)"
          style={{ mixBlendMode: theme === 'dark' ? 'darken' : 'overlay' }}
        />
        <g style={{ mixBlendMode: 'overlay' }}>
          <path d="M10.5 6H8.5V8H10.5V6Z" fill="white" />
          <path d="M12.5 8H10.5V10H12.5V8Z" fill="white" />
        </g>
      </svg>
    </div>
  );
};
