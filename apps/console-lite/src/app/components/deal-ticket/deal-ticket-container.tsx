import { useParams } from 'react-router-dom';
import { usePartyBalanceQuery } from '@vegaprotocol/deal-ticket';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import {
  t,
  useDataProvider,
  removePaginationWrapper,
} from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { DealTicketSteps } from './deal-ticket-steps';
import { DealTicketBalance } from './deal-ticket-balance';
import Baubles from './baubles-decor';
import ConnectWallet from '../wallet-connector';
import { useMemo } from 'react';
import type {
  MarketDataUpdateFieldsFragment,
  MarketDealTicket,
} from '@vegaprotocol/market-list';
import { marketDealTicketProvider } from '@vegaprotocol/market-list';

const tempEmptyText = (
  <p>{t('Please select a market from the markets page')}</p>
);

export const DealTicketContainer = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const { pubKey } = useVegaWallet();

  const { data: partyData } = usePartyBalanceQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const variables = useMemo(
    () => ({
      marketId: marketId || '',
    }),
    [marketId]
  );
  const { data, loading } = useDataProvider<
    MarketDealTicket,
    MarketDataUpdateFieldsFragment
  >({
    dataProvider: marketDealTicketProvider,
    variables,
    skip: !marketId,
  });

  const accounts = removePaginationWrapper(
    partyData?.party?.accountsConnection?.edges
  );

  const loader = <Loader />;
  if (marketId && data) {
    const balance = (
      <DealTicketBalance
        className="mb-4"
        settlementAsset={
          data.tradableInstrument.instrument.product?.settlementAsset
        }
        accounts={accounts || []}
        isWalletConnected={!!pubKey}
      />
    );

    const container = (
      <>
        {loading ? loader : balance}
        <DealTicketSteps market={data} />
      </>
    );

    return (
      <section className="flex p-4 md:p-6">
        <section className="w-full md:w-1/2 md:min-w-[500px]">
          {pubKey ? container : <ConnectWallet />}
        </section>
        <Baubles />
      </section>
    );
  }
  return marketId ? (
    <Splash>
      <p>{t('Could not load market')}</p>
    </Splash>
  ) : (
    tempEmptyText
  );
};
