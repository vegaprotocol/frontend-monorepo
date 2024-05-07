export const IconPause = ({
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
          fill="#65676b"
        />
        <circle cx="10" cy="9.99998" r="6" stroke="white" />
        <line
          x1="8.5"
          y1="7.83333"
          x2="8.5"
          y2="11.8333"
          stroke="white"
          stroke-linecap="round"
        />
        <line
          x1="11.8333"
          y1="7.83333"
          x2="11.8333"
          y2="11.8333"
          stroke="white"
          stroke-linecap="round"
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
      <circle cx="12" cy="12" r="10" stroke="currentColor" />
      <line
        x1="9.5"
        y1="8.5"
        x2="9.5"
        y2="15.5"
        stroke="currentColor"
        stroke-linecap="round"
      />
      <line
        x1="14.5"
        y1="8.5"
        x2="14.5"
        y2="15.5"
        stroke="currentColor"
        stroke-linecap="round"
      />
    </svg>
  );
};
