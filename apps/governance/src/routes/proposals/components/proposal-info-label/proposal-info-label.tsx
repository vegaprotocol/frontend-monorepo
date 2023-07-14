import classNames from 'classnames';
import type { ReactNode } from 'react';

export type ProposalInfoLabelVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'highlight';

const base = 'rounded-full px-3 py-1 font-alpha';
const primary = 'bg-vega-green text-black';
const secondary = 'bg-vega-dark-200 text-vega-light-200';
const tertiary = 'bg-vega-dark-150 text-vega-light-200';
const highlight = 'bg-vega-yellow text-black';

const getClassname = (variant: ProposalInfoLabelVariant) => {
  return classNames(base, {
    [primary]: variant === 'primary',
    [secondary]: variant === 'secondary',
    [tertiary]: variant === 'tertiary',
    [highlight]: variant === 'highlight',
  });
};

interface ProposalInfoLabelProps {
  children: ReactNode;
  variant?: ProposalInfoLabelVariant;
}

export const ProposalInfoLabel = ({
  children,
  variant = 'primary',
}: ProposalInfoLabelProps) => {
  return <div className={getClassname(variant)}>{children}</div>;
};
