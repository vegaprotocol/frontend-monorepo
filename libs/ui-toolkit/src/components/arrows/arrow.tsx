export interface ArrowStyleProps {
  color?: string;
  borderX?: number;
  borderTop?: number;
  borderBottom?: number;
}

export const ArrowUp = ({
  color = 'green',
  borderX = 4,
  borderBottom = 4,
}: ArrowStyleProps) => (
  <span
    data-testid="arrow-up"
    style={{
      borderLeft: `${borderX}px solid transparent`,
      borderRight: `${borderX}px solid transparent`,
      borderBottom: `${borderBottom}px solid`,
    }}
    className={`w-0 h-0 border-b-${color}-dark dark:border-b-${color}`}
  ></span>
);
export const ArrowDown = ({
  color = 'red',
  borderX = 4,
  borderTop = 4,
}: ArrowStyleProps) => (
  <span
    data-testid="arrow-down"
    style={{
      borderLeft: `${borderX}px solid transparent`,
      borderRight: `${borderX}px solid transparent`,
      borderTop: `${borderTop}px solid`,
    }}
    className={`w-0 h-0 border-t-${color}-dark dark:border-t-${color}`}
  ></span>
);

// Arrow
export interface ArrowProps {
  value: number | bigint;
}

export const Arrow = ({ value }: ArrowProps) =>
  value === 0 ? null : value > 0 ? <ArrowUp /> : <ArrowDown />;
