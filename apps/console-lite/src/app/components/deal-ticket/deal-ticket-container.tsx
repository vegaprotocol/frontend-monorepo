import { useParams } from 'react-router-dom';
import compact from 'lodash/compact';
import {
  DealTicketManager,
  DealTicketContainer as Container,
  usePartyBalanceQuery,
} from '@vegaprotocol/deal-ticket';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { DealTicketSteps } from './deal-ticket-steps';
import { DealTicketBalance } from './deal-ticket-balance';
import Baubles from './baubles-decor';
import ConnectWallet from '../wallet-connector';

const tempEmptyText = (
  <p>{t('Please select a market from the markets page')}</p>
);

export const DealTicketContainer = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const { pubKey } = useVegaWallet();

  const { data: partyData, loading } = usePartyBalanceQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const loader = <Loader />;

  const container = marketId ? (
    <Container marketId={marketId}>
      {(data) => {
        if (!data.market) {
          return null as unknown as JSX.Element;
        }

        const accounts = compact(
          partyData?.party?.accountsConnection?.edges
        ).map((e) => e.node);
        const balance = (
          <DealTicketBalance
            className="mb-4"
            settlementAsset={
              data.market.tradableInstrument.instrument.product?.settlementAsset
            }
            accounts={accounts || []}
            isWalletConnected={!!pubKey}
          />
        );

        return (
          <DealTicketManager market={data.market}>
            {loading ? loader : balance}
            <DealTicketSteps market={data.market} />
          </DealTicketManager>
        );
      }}
    </Container>
  ) : (
    tempEmptyText
  );

  return (
    <section className="flex p-4 md:p-6">
      <section className="w-full md:w-1/2 md:min-w-[500px]">
        {pubKey ? container : <ConnectWallet />}
      </section>
      <Baubles />
    </section>
  );
};
