export const ArrowUp = () => (
  <span className="w-0 h-0 border-x border-x-[4px] border-solid	 border-x-transparent border-b-[4px] border-b-green"></span>
);
export const ArrowDown = () => (
  <span className="w-0 h-0 border-x border-x-[4px] border-solid	 border-x-transparent border-t-[4px] border-t-red"></span>
);

// Arrow
export interface ArrowProps {
  value: number;
}

export const Arrow = ({ value }: ArrowProps) =>
  value === 0 ? null : value > 0 ? <ArrowUp /> : <ArrowDown />;
