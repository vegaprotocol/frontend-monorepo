import classNames from 'classnames';

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
}: ArrowStyleProps) => {
  const className = classNames(
    `w-0 h-0 border-x`,
    `border-x-[` + borderX + `px]`,
    `border-solid border-x-transparent`,
    `border-b-[` + borderBottom + `px]`,
    `border-b-${color}-dark`,
    `dark:border-b-${color}`
  );
  return <span data-testid="arrow-up" className={className}></span>;
};
export const ArrowDown = ({
  color = 'red',
  borderX = 4,
  borderTop = 4,
}: ArrowStyleProps) => {
  const className = classNames(
    `w-0 h-0 border-x`,
    `border-x-[` + borderX + `px]`,
    `border-solid`,
    `border-x-transparent`,
    `border-t-[` + borderTop + `px]`,
    `border-t-${color}-dark`,
    `dark:border-t-${color}`
  );
  return <span data-testid="arrow-down" className={className}></span>;
};

// Arrow
export interface ArrowProps extends ArrowStyleProps {
  value: number | bigint;
}

export const Arrow = ({ value }: ArrowProps) =>
  value === 0 ? null : value > 0 ? <ArrowUp /> : <ArrowDown />;
