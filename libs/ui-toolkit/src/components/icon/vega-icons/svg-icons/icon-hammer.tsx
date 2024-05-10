export const IconHammer = ({
  size = 16,
  background = true,
}: {
  size?: number;
  background?: boolean;
}) => {
  if (background) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z"
          fill="#323339"
        />
        <rect
          x="8.59424"
          y="8.65686"
          width="3"
          height="6.4974"
          transform="rotate(45 8.59424 8.65686)"
          stroke="white"
          stroke-linejoin="round"
        />
        <rect
          x="10.0942"
          y="3"
          width="9.07233"
          height="5"
          transform="rotate(45 10.0942 3)"
          stroke="white"
          stroke-linejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="12.6606"
        y="13.3119"
        width="12"
        height="4.49049"
        transform="rotate(135 12.6606 13.3119)"
        stroke="currentColor"
        stroke-linejoin="round"
      />
      <rect
        x="11.6919"
        y="1"
        width="14"
        height="8"
        transform="rotate(45 11.6919 1)"
        stroke="currentColor"
        stroke-linejoin="round"
      />
    </svg>
  );
};
