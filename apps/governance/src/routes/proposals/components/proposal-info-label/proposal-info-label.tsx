import { cn } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

export type ProposalInfoLabelVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'highlight';

const base = 'rounded px-1 py-[2px] text-xs flex items-center gap-1';
const primary = 'bg-green text-black';
const secondary = 'bg-gs-600 text-gs-50';
const tertiary = 'bg-gs-500 text-gs-50';
const highlight = 'bg-yellow text-black';

const getClassname = (variant: ProposalInfoLabelVariant) => {
  return cn(base, {
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
