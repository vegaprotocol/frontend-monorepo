import type { ReactElement } from 'react';
import { LiquidityIconPath } from './liquidity-icon';
import { MarketIconPath } from './market-icon';
import { TradeIconPath } from './trade-icon';
import { PortfolioIconPath } from './portfolio-icon';

interface IconProps {
  name: string;
  className: string;
}

interface IconSVGWrapperProps {
  className: string;
  children: ReactElement | ReactElement[] | null;
}

const getIconPath = (name: string): ReactElement | null => {
  switch (name) {
    case 'liquidity':
      return <LiquidityIconPath />;
    case 'market':
      return <MarketIconPath />;
    case 'trade':
      return <TradeIconPath />;
    case 'portfolio':
      return <PortfolioIconPath />;
    default:
      return null;
  }
};

const IconSVGWrapper = ({ className, children }: IconSVGWrapperProps) => {
  return (
    <svg
      role="presentation"
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      {children}
    </svg>
  );
};

export const Icon = ({ name, className }: IconProps) => {
  return (
    <IconSVGWrapper className={className}>{getIconPath(name)}</IconSVGWrapper>
  );
};
