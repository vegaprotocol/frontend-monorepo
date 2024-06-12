export const IconClosed = ({ size = 16 }: { size?: number }) => {
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
        x1="4.92896"
        y1="18.364"
        x2="18.364"
        y2="4.92892"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
};
