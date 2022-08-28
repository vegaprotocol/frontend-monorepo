export interface ArrowStyleProps {
  borderX?: number;
  borderTop?: number;
  borderBottom?: number;
  up?: boolean;
}

export const ArrowUp = ({ borderX = 4, borderBottom = 4 }: ArrowStyleProps) => (
  <span
    data-testid="arrow-up"
    style={{
      borderLeft: `${borderX}px solid transparent`,
      borderRight: `${borderX}px solid transparent`,
      borderBottom: `${borderBottom}px solid`,
    }}
    className={`w-0 h-0 border-b-currentColor-dark dark:border-b-currentColor`}
  ></span>
);

export const ArrowDown = ({ borderX = 4, borderTop = 4 }: ArrowStyleProps) => (
  <span
    data-testid="arrow-down"
    style={{
      borderLeft: `${borderX}px solid transparent`,
      borderRight: `${borderX}px solid transparent`,
      borderTop: `${borderTop}px solid`,
    }}
    className={`w-0 h-0 border-t-currentColor-dark dark:border-t-currentColor`}
  ></span>
);

// Arrow
export interface ArrowProps {
  value: number | bigint;
}

export const Arrow = ({ value }: ArrowProps) =>
  value === 0 ? null : value > 0 ? <ArrowUp /> : <ArrowDown />;
