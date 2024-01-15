import { theme } from '@vegaprotocol/tailwindcss-config';

type DudeWithFlagProps = {
  flagColor?: string;
  withStar?: boolean;
  className?: string;
};

const DEFAULT_FLAG_COLOR = theme.colors.vega.green[500];

export const DudeWithFlag = ({
  flagColor = DEFAULT_FLAG_COLOR,
  withStar = true,
  className,
}: DudeWithFlagProps) => {
  return (
    <svg
      width="49"
      height="43"
      viewBox="0 0 49 43"
      fill="none"
      className={className}
    >
      {withStar && (
        <>
          <path d="M3.99992 0H2V1.99993H3.99992V0Z" fill="white" />
          <path
            d="M2 1.99993L0 1.99981V3.99974H1.99992L2 1.99993Z"
            fill="white"
          />
          <path
            d="M3.99995 3.99992L1.99992 3.99974L2 5.99988H3.99995V3.99992Z"
            fill="white"
          />
          <path
            d="M5.99997 1.99981L3.99992 1.99993L3.99995 3.99992L5.99997 3.99974V1.99981Z"
            fill="white"
          />
        </>
      )}
      <path
        d="M32 4H11V33H15V43H20V33H23V43H28V33H32V4ZM20 17H15V12H20V17ZM28 17H23V12H28V17Z"
        fill="white"
      />
      <path d="M41 25L32 25L32 20L41 20L41 25Z" fill="white" />
      <path d="M36 29V4H35V29" fill="white" />
      <path d="M36 13H49L44.55 8.5L49 4H36V13Z" fill={flagColor} />
    </svg>
  );
};
