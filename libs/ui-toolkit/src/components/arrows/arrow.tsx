export interface ArrowStyleProps {
  color?: string;
}

export const ArrowUp = ({ color = 'green' }: ArrowStyleProps) => (
  <span
    data-testid="arrow-up"
    className={`w-0 h-0 border-x border-x-[4px] border-solid border-x-transparent border-b-[4px] border-b-${color}-dark dark:border-b-${color}`}
  ></span>
);
export const ArrowDown = ({ color = 'red' }: ArrowStyleProps) => (
  <span
    data-testid="arrow-down"
    className={`w-0 h-0 border-x border-x-[8px] border-solid border-x-transparent border-t-[12px] border-t-${color}-dark dark:border-t-${color}`}
  ></span>
);

// Arrow
export interface ArrowProps {
  value: number | bigint;
}

export const Arrow = ({ value }: ArrowProps) =>
  value === 0 ? null : value > 0 ? <ArrowUp /> : <ArrowDown />;
