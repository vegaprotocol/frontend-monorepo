export const IconTicket = ({ size = 16 }: { size: number }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect x="9" y="10" width="3" height="2" />
      <rect x="9" y="7" width="3" height="1" />
      <rect x="4" y="7" width="4" height="1" />
      <rect x="6" y="4" width="6" height="1" />
      <rect x="5" y="5" width="1" height="1" />
      <rect x="4" y="4" width="1" height="1" />
      <rect
        x="2.5"
        y="2.5"
        width="11"
        height="11"
        fill="transparent"
        stroke="currentColor"
      />
    </svg>
  );
};
