import locators from '../locators';

export const Wallet = ({
  className,
  squareFill,
  size = 21,
}: {
  className?: string;
  squareFill?: string;
  size?: number;
}) => {
  return (
    <svg
      data-testid={locators.walletIcon}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 21 19"
      fill="none"
    >
      <rect x="1.33331" y="1" width="17" height="17" stroke="currentColor" />
      <rect
        x="13.3333"
        y="6"
        width="7"
        height="7"
        fill={squareFill}
        stroke="currentColor"
      />
      <rect x="15.8333" y="8.5" width="2" height="2" fill="currentColor" />
    </svg>
  );
};
