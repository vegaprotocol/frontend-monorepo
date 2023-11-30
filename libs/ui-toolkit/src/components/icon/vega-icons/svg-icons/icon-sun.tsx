export const IconSun = ({ size = 16 }: { size: number }) => {
  return (
    // TODO: we need to rescale the icon in an svg editor so the view box is the default 0 0 16 16
    <svg width={size} height={size} viewBox="0 0 45 45">
      <path
        d="M22.5 27.79a5.29 5.29 0 1 0 0-10.58 5.29 5.29 0 0 0 0 10.58Z"
        fill="currentColor"
      />
      <path
        d="M15.01 22.5H10M35 22.5h-5.01M22.5 29.99V35M22.5 10v5.01M17.21 27.79l-3.55 3.55M31.34 13.66l-3.55 3.55M27.79 27.79l3.55 3.55M13.66 13.66l3.55 3.55"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeMiterlimit="10"
      />
    </svg>
  );
};
