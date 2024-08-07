import locators from '../locators';

export const VegaIcon = ({
  color = 'white',
  backgroundColor = 'black',
  size = 64,
}: {
  color?: string;
  size?: number;
  backgroundColor?: string;
}) => {
  return (
    <svg
      data-testid={locators.vegaIcon}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
    >
      <rect width="64" height="64" rx="8" fill={backgroundColor} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3333 42.3333H20.3333V10.3333H14.3333V42.3333Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M37.6667 36.3333H43.6667V10.3333H37.6667V36.3333Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.3333 54H32.3333V48H26.3333V54Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32.3333 48.3333H38.3333V42.3333H32.3333V48.3333Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M43.6667 42.3333H49.6667V36.3333H43.6667V42.3333Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.3333 48.3333H26.3333V42.3333H20.3333V48.3333Z"
        fill={color}
      />
    </svg>
  );
};
