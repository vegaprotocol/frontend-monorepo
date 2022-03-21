import React from 'react';

interface PromotedStatsProps {
  children: React.ReactNode;
}

export const PromotedStats = ({ children }: PromotedStatsProps) => {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-1 gap-1 mb-6">
      {children}
    </div>
  );
};
