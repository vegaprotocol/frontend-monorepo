export const ChevronDownIcon = ({ active }: ChevronDownIconProps) => {
  const rotate = active
    ? 'transform duration-300 ease rotate-180'
    : 'transform duration-300 ease';
  return (
    <svg
      width="14"
      height="8"
      aria-label="chevron icon"
      data-testid="accordion-chevron-icon"
      viewBox="0 0 14 8"
      fill="fillCurrent"
      xmlns="http://www.w3.org/2000/svg"
      className={`${rotate} inline-block fill-black dark:fill-white mx-4`}
    >
      <rect x="12" y="0" width="2" height="2" />
      <rect x="10" y="2" width="2" height="2" />
      <rect x="8" y="4" width="2" height="2" />
      <rect x="6" y="6" width="2" height="2" />
      <rect x="4" y="4" width="2" height="2" />
      <rect x="2" y="2" width="2" height="2" />
      <rect x="0" y="0" width="2" height="2" />
    </svg>
  );
};

export interface ChevronDownIconProps {
  active: boolean;
}

export default ChevronDownIcon;
