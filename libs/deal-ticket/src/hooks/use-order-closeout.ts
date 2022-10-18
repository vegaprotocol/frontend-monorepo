import { BigNumber } from 'bignumber.js';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { addDecimal, formatNumber } from '@vegaprotocol/react-helpers';
import { useMarketPositions } from './use-market-positions';
import { useMarketData } from './use-market-data';
import { usePartyMarketDataQuery } from './__generated__/PartyMarketData';
import { Side } from '@vegaprotocol/types';
import type { DealTicketMarketFragment } from '../components/deal-ticket/__generated___/DealTicket';
import type { PartyBalanceQuery } from './__generated__/PartyBalance';
import { useSettlementAccount } from './use-settlement-account';

interface Props {
  order: OrderSubmissionBody['orderSubmission'];
  market: DealTicketMarketFragment;
  partyData?: PartyBalanceQuery;
}

export const useOrderCloseOut = ({
  order,
  market,
  partyData,
}: Props): string | null => {
  const { pubKey } = useVegaWallet();
  const account = useSettlementAccount(
    market.tradableInstrument.instrument.product.settlementAsset.id,
    partyData?.party?.accounts || []
  );
  const { data } = usePartyMarketDataQuery({
    pollInterval: 5000,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const markPriceData = useMarketData(market.id);
  const marketPositions = useMarketPositions({
    marketId: market.id,
    partyId: pubKey || '',
  });

  const marginMaintenanceLevel = new BigNumber(
    addDecimal(
      data?.party?.marginsConnection?.edges?.find(
        (nodes) => nodes.node.market.id === market.id
      )?.node.maintenanceLevel || 0,
      market.decimalPlaces
    )
  );
  const positionAccount = data?.party?.accounts?.find(
    (account) => account.market?.id === market.id
  );
  const positionAccountBalance = new BigNumber(
    addDecimal(
      positionAccount?.balance || 0,
      positionAccount?.asset?.decimals || 0
    )
  );
  const generalAccountBalance = new BigNumber(
    addDecimal(account?.balance || 0, account?.asset.decimals || 0)
  );
  const volume = marketPositions?.openVolume
    ? new BigNumber(
        addDecimal(
          marketPositions?.openVolume.toString(),
          market.positionDecimalPlaces
        )
      )[order.side === Side.SIDE_BUY ? 'plus' : 'minus'](order.size)
    : null;
  const markPrice = new BigNumber(
    addDecimal(
      markPriceData?.market?.data?.markPrice || 0,
      markPriceData?.market?.decimalPlaces || 0
    )
  );
  // regarding formula (marginMaintenanceLevel - positionAccountBalance - generalAccountBalance) / volume + markPrice
  const marginDifference = marginMaintenanceLevel
    .minus(positionAccountBalance)
    .minus(generalAccountBalance);
  const closeOut = volume && marginDifference.div(volume).plus(markPrice);
  if (closeOut && closeOut.isPositive()) {
    return formatNumber(closeOut, market.decimalPlaces);
  }
  return null;
};
