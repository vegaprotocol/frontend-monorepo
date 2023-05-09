import classNames from 'classnames';
import type { ReactNode } from 'react';

export type ProposalInfoLabelVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'highlight';

const base = 'rounded-md px-2 py-1 font-alpha';
const primary = 'bg-vega-light-150 text-black';
const secondary = 'bg-vega-dark-200 text-white';
const tertiary = 'bg-vega-dark-150 text-white';
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
