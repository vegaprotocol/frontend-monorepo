export const ChevronDownIcon = ({ active }: ChevronDownIconProps) => {
  const rotate = active
    ? 'transform duration-300 ease rotate-180'
    : 'transform duration-300 ease';
  return (
    <svg
      width="20"
      height="20"
      aria-label="chevron icon"
      data-testid="accordion-chevron-icon"
      viewBox="0 0 20 20"
      fill="fillCurrent"
      xmlns="http://www.w3.org/2000/svg"
      className={`${rotate} inline-block fill-black dark:fill-white`}
    >
      <rect x="17" y="8" width="2" height="2" />
      <rect x="15" y="10" width="2" height="2" />
      <rect x="13" y="12" width="2" height="2" />
      <rect x="11" y="14" width="2" height="2" />
      <rect x="9" y="12" width="2" height="2" />
      <rect x="7" y="10" width="2" height="2" />
      <rect x="5" y="8" width="2" height="2" />
    </svg>
  );
};

export interface ChevronDownIconProps {
  active: boolean;
}

export default ChevronDownIcon;
