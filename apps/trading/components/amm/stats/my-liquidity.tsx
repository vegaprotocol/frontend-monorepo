import {
  useAMMs,
  useLiquidityProvisions,
  type Market,
} from '@vegaprotocol/rest';
import {
  v1AMMStatus,
  vegaLiquidityProvisionStatus,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import BigNumber from 'bignumber.js';
import compact from 'lodash/compact';
import { LoaderCircleIcon } from 'lucide-react';

export const MyLiquidity = ({ market }: { market: Market }) => {
  const { pubKey } = useVegaWallet();

  if (!pubKey) {
    return '-';
  }

  return <LiquidityProvided market={market} partyId={pubKey} />;
};

const LiquidityProvided = ({
  market,
  partyId,
}: {
  market: Market;
  partyId: string;
}) => {
  const { data: ammsData, status: ammsStatus } = useAMMs({
    marketId: market.id,
    partyId,
  });
  const { data: provisionsData, status: provisionsStatus } =
    useLiquidityProvisions(market.id);

  if (ammsStatus === 'pending' || provisionsStatus === 'pending') {
    return (
      <div className="h-4 py-1">
        <LoaderCircleIcon size={14} className="animate-spin" />
      </div>
    );
  }

  const amms = compact(
    ammsData
      ?.filter(
        (a) =>
          a.status === v1AMMStatus.STATUS_ACTIVE &&
          a.marketId === market.id &&
          a.partyId === partyId
      )
      ?.map((a) => {
        return a.commitment.value;
      })
  );
  const provisions = compact(
    provisionsData
      ?.filter(
        (p) =>
          p.status === vegaLiquidityProvisionStatus.STATUS_ACTIVE &&
          p.marketId === market.id &&
          p.partyId === partyId
      )
      ?.map((p) => {
        return p.commitmentAmount.value;
      })
  );

  const commitment = BigNumber.sum.apply(null, [...amms, ...provisions]);

  return <span>{commitment.isNaN() ? '-' : commitment.toFormat()}</span>;
};
