export const IconPause = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" />
      <line
        x1="9.5"
        y1="8.5"
        x2="9.5"
        y2="15.5"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <line
        x1="14.5"
        y1="8.5"
        x2="14.5"
        y2="15.5"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
};
