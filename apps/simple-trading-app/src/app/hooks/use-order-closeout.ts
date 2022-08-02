import { BigNumber } from 'bignumber.js';
import type { Order } from '@vegaprotocol/orders';
import type { DealTicketQuery_market } from '@vegaprotocol/deal-ticket';
import type { PartyBalanceQuery } from '../components/deal-ticket/__generated__/PartyBalanceQuery';
import { useSettlementAccount } from './use-settlement-account';
import { useVegaWallet, VegaWalletOrderSide } from '@vegaprotocol/wallet';
import { addDecimal, formatNumber } from '@vegaprotocol/react-helpers';
import { gql, useQuery } from '@apollo/client';
import useMarketPositions from './use-market-positions';
import useMarketData from './use-market-data';
import type {
  PartyMarketData,
  PartyMarketDataVariables,
} from './__generated__/PartyMarketData';

const CLOSEOUT_PRICE_QUERY = gql`
  query PartyMarketData($partyId: ID!) {
    party(id: $partyId) {
      id
      accounts {
        type
        balance
        asset {
          id
          decimals
        }
        market {
          id
        }
      }
      marginsConnection {
        edges {
          node {
            market {
              id
            }
            initialLevel
            maintenanceLevel
            searchLevel
          }
        }
      }
      positionsConnection {
        edges {
          node {
            openVolume
            market {
              id
            }
          }
        }
      }
    }
  }
`;

interface Props {
  order: Order;
  market: DealTicketQuery_market;
  partyData?: PartyBalanceQuery;
}

const useOrderCloseOut = ({ order, market, partyData }: Props): string => {
  const { keypair } = useVegaWallet();
  const account = useSettlementAccount(
    market.tradableInstrument.instrument.product.settlementAsset.id,
    partyData?.party?.accounts || []
  );
  const { data } = useQuery<PartyMarketData, PartyMarketDataVariables>(
    CLOSEOUT_PRICE_QUERY,
    {
      pollInterval: 5000,
      variables: { partyId: keypair?.pub || '' },
      skip: !keypair?.pub,
    }
  );

  const markPriceData = useMarketData(market.id);
  const marketPositions = useMarketPositions({
    marketId: market.id,
    partyId: keypair?.pub || '',
  });

  const marginMaintenanceLevel = new BigNumber(
    addDecimal(
      data?.party?.marginsConnection.edges?.find(
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
  const volume = new BigNumber(
    addDecimal(
      marketPositions?.openVolume.toNumber() || 0,
      market.positionDecimalPlaces
    )
  )[order.side === VegaWalletOrderSide.Buy ? 'plus' : 'minus'](order.size);
  const markPrice = new BigNumber(
    addDecimal(
      markPriceData?.market?.data?.markPrice || 0,
      markPriceData?.market?.decimalPlaces || 0
    )
  );

  const marginDifference = marginMaintenanceLevel
    .minus(positionAccountBalance)
    .minus(generalAccountBalance);
  const closeOut = BigNumber.maximum(
    0,
    marginDifference.div(volume).plus(markPrice)
  );

  return formatNumber(closeOut, market.decimalPlaces);
};

export default useOrderCloseOut;
