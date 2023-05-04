import classNames from 'classnames';
import type { ReactNode } from 'react';

export type ProposalInfoLabelVariant = 'primary' | 'secondary' | 'highlight';

const base = 'rounded-md px-2 py-1 font-alpha';
const primary = 'bg-vega-dark-150 text-white';
const secondary = 'bg-vega-light-150 text-black';
const highlight = 'bg-vega-yellow text-black';

const getClassname = (variant: ProposalInfoLabelVariant) => {
  return classNames(base, {
    [primary]: variant === 'primary',
    [secondary]: variant === 'secondary',
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
