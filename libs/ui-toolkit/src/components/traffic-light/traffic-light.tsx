import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TrafficLightProps {
  value: number;
  q1: number;
  q2: number;
  children: ReactNode;
}

export const TrafficLight = ({
  value,
  q1,
  q2,
  children,
}: TrafficLightProps) => {
  const slippageClassName = cn({
    'text-darkerGreen dark:text-lightGreen': value < q1,
    'text-amber': value >= q1 && value < q2,
    'text-vega-pink': value >= q2,
  });

  return <div className={slippageClassName}>{children || value}</div>;
};
