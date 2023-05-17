export const IconBreakdown = ({ size = 16 }: { size: number }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <circle
        cx="8"
        cy="8"
        r="6.5"
        className="stroke-current fill-transparent"
      />
      <rect
        x="8.5"
        y="11"
        width="1"
        height="4"
        transform="rotate(-180 8.5 11)"
      />
      <rect x="8.5" y="6" width="1" height="1" transform="rotate(-180 8.5 6)" />
    </svg>
  );
};
