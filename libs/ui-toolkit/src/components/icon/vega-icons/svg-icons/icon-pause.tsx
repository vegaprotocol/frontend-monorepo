export const IconPause = ({ size = 16 }: { size: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="white" />
      <line
        x1="9.5"
        y1="8.5"
        x2="9.5"
        y2="15.5"
        stroke="white"
        stroke-linecap="round"
      />
      <line
        x1="14.5"
        y1="8.5"
        x2="14.5"
        y2="15.5"
        stroke="white"
        stroke-linecap="round"
      />
    </svg>
  );
};
