export const ErrorIcon = ({ color = '#FF077F' }: { color?: string }) => {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <g clipPath="url(#clip0_3642_6558)">
        <rect x="27" y="24" width="2" height="12" fill={color} />
        <rect x="27" y="39" width="2" height="2" fill={color} />
        <path
          d="M28 9.01556L50.2768 48H5.72318L28 9.01556Z"
          stroke={color}
          strokeWidth="2"
        />
      </g>
      <defs>
        <clipPath id="clip0_3642_6558">
          <rect
            width="48"
            height="42"
            fill="white"
            transform="translate(4 7)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
