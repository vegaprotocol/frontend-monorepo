export const IconMonitor = ({
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
          x="6"
          y="5"
          width="8"
          height="6.66667"
          stroke="white"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4 12V14H16V12"
          stroke="white"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 8.33333L9.33333 9.66667L12 7"
          stroke="white"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="6"
        y="5"
        width="12"
        height="10"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M3 15V18H21V15"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9 10L11 12L15 8"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
