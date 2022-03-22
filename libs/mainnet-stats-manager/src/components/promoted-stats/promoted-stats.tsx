import React from 'react';

interface PromotedStatsProps {
  children: React.ReactNode;
}

export const PromotedStats = ({ children }: PromotedStatsProps) => {
  return (
    <div className="grid promoted-stats content-start gap-4 mb-24">
      {children}
    </div>
  );
};
