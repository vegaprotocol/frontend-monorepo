import * as React from 'react';

export const ChevronDownIcon = React.forwardRef<SVGSVGElement>(
  ({ ...props }) => {
    return (
      <svg
        width="20"
        height="20"
        aria-label="chevron icon"
        data-testid="accordion-chevron-icon"
        viewBox="0 0 20 20"
        fill="fillCurrent"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className={`inline-block fill-black dark:fill-white`}
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
  }
);

export default ChevronDownIcon;
