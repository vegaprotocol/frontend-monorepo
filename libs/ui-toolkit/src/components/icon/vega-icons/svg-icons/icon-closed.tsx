export const IconClosed = ({
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
          x1="5.75732"
          y1="13.5355"
          x2="13.5355"
          y2="5.75736"
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
        x1="4.92896"
        y1="18.364"
        x2="18.364"
        y2="4.92892"
        stroke="currentColor"
        stroke-linecap="round"
      />
    </svg>
  );
};
