export const ArrowUp = () => (
  <span
    data-testid="arrow-up"
    className="w-0 h-0 border-x border-x-[4px] border-solid border-x-transparent border-b-[4px] border-b-green-dark dark:border-b-green"
  ></span>
);
export const ArrowDown = () => (
  <span
    data-testid="arrow-down"
    className="w-0 h-0 border-x border-x-[4px] border-solid border-x-transparent border-t-[4px] border-t-red-dark dark:border-t-red"
  ></span>
);

// Arrow
export interface ArrowProps {
  value: number;
}

export const Arrow = ({ value }: ArrowProps) =>
  value === 0 ? null : value > 0 ? <ArrowUp /> : <ArrowDown />;
