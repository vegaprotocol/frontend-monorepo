import { OrderTimeInForce } from '@vegaprotocol/enums';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

import { processTimeInForce, TIF_MAP } from '@/lib/enums';
import { formatNanoDate } from '@/lib/utils';

const OrderBadge = ({ children }: { children: ReactNode }) => {
  return (
    <Lozenge className="text-xs mr-0.5 text-surface-0-fg-muted whitespace-nowrap">
      {children}
    </Lozenge>
  );
};

const TifBadge = ({
  timeInForce,
  expiresAt,
}: {
  timeInForce: OrderTimeInForce;
  expiresAt: string | undefined;
}) => {
  if (timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT) {
    if (!expiresAt) {
      throw new Error('GTT order without expiresAt');
    }
    return <OrderBadge>Good til {formatNanoDate(expiresAt)}</OrderBadge>;
  }
  const tif = processTimeInForce(timeInForce);
  return <OrderBadge>{TIF_MAP[tif]}</OrderBadge>;
};

export const OrderBadges = ({
  postOnly,
  reduceOnly,
  timeInForce,
  expiresAt,
}: Partial<{
  postOnly: boolean;
  reduceOnly: boolean;
  timeInForce: OrderTimeInForce;
  expiresAt: string;
}>) => {
  const postBadge = postOnly ? <OrderBadge>Post only</OrderBadge> : null;
  const reduceBadge = reduceOnly ? <OrderBadge>Reduce only</OrderBadge> : null;
  const tifBadge = timeInForce ? (
    <TifBadge timeInForce={timeInForce} expiresAt={expiresAt} />
  ) : null;
  return (
    <div className="break-all">
      {tifBadge}
      {reduceBadge}
      {postBadge}
    </div>
  );
};
