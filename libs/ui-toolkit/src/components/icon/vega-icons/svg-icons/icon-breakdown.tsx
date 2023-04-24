export const IconBreakdown = ({ size = 16 }: { size: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="6.5" stroke="white" />
      <rect
        x="8.5"
        y="11"
        width="1"
        height="4"
        transform="rotate(-180 8.5 11)"
        fill="white"
      />
      <rect
        x="8.5"
        y="6"
        width="1"
        height="1"
        transform="rotate(-180 8.5 6)"
        fill="white"
      />
    </svg>
  );
};
