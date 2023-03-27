import { useEffect, useRef, useState } from 'react';
import get from 'lodash/get';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { Link } from 'react-router-dom';
import { useKeyHoldingStore } from '../key-holding-store';

const MARKET_PATH = 'markets';

interface MarketNameCellProps {
  value?: string;
  data?: { id?: string; marketId?: string; market?: { id: string } };
  idPath?: string;
}

export const MarketNameCell = ({
  value,
  data,
  idPath,
}: MarketNameCellProps) => {
  const holdingKey = useKeyHoldingStore((store) => store.holdingKey);
  const ref = useRef<HTMLDivElement | null>(null);
  const [on, setOn] = useState(false);
  const [externalKeyDown, setExternalKeyDown] = useState(false);

  useEffect(() => {
    setExternalKeyDown(['Meta', 'Control'].includes(holdingKey) && on);
    if (on) {
      ref.current?.focus();
    } else {
      ref.current?.blur();
    }
  }, [on, holdingKey]);

  if (!data) return null;
  const id = get(data, idPath ?? 'id', 'all');

  const marketPath = `/#/${MARKET_PATH}/${id}`;

  const linkContent = externalKeyDown ? (
    <ExternalLink href={marketPath} onClick={(e) => e.stopPropagation()}>
      {value}
    </ExternalLink>
  ) : (
    <Link to={marketPath}>{value}</Link>
  );
  return (
    <div
      data-testid={`market-${data.id}`}
      ref={ref}
      role="link"
      tabIndex={0}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
    >
      {linkContent}
    </div>
  );
};
