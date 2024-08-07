import locators from '../locators';

export const LeftRightArrows = ({ className }: { className: string }) => {
  return (
    <svg
      data-testid={locators.leftRightArrows}
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.5 7.5H2M2 7.5L7 2M2 7.5L7 13" stroke="currentColor" />
      <path
        d="M11.5 16.5H22M22 16.5L17 22M22 16.5L17 11"
        stroke="currentColor"
      />
    </svg>
  );
};
