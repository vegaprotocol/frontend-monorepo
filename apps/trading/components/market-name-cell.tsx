import { useGlobalStore } from '../stores';
import type { VegaICellRendererParams } from '@vegaprotocol/datagrid';
import type { MarketMaybeWithData } from '@vegaprotocol/market-list';
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Icon } from '@vegaprotocol/ui-toolkit';
import { Links, Routes } from '../pages/client-router';
import { Link } from 'react-router-dom';

export const MarketNameCell = ({
  value,
  data,
}: VegaICellRendererParams<
  MarketMaybeWithData,
  'tradableInstrument.instrument.code'
>) => {
  const holdingKey = useGlobalStore((store) => store.holdingKey);
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

  const linkContent = externalKeyDown ? (
    <ExternalLink
      href={`#${Links[Routes.MARKET](data.id)}`}
      onClick={(e) => e.stopPropagation()}
    >
      {value}
    </ExternalLink>
  ) : (
    <Link to={Links[Routes.MARKET](data.id)}>{value}</Link>
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
