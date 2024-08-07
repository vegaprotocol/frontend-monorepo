import locators from '../locators';

export const UpDownArrows = ({ className }: { className: string }) => {
  return (
    <svg
      className={className}
      data-testid={locators.connectionsIcon}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        d="M15.5 11.5L15.5 1M15.5 1L21 6M15.5 1L10 6"
        stroke="currentColor"
      />
      <path
        d="M6.5 10.5L6.5 21M6.5 21L1 16M6.5 21L12 16"
        stroke="currentColor"
      />
    </svg>
  );
};
