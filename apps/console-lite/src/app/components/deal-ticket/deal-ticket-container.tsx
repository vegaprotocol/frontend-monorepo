import * as React from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import {
  DealTicketManager,
  DealTicketContainer as Container,
} from '@vegaprotocol/deal-ticket';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { DealTicketSteps } from './deal-ticket-steps';
import { DealTicketBalance } from './deal-ticket-balance';
import Baubles from './baubles-decor';
import type { PartyBalanceQuery } from './__generated__/PartyBalanceQuery';
import ConnectWallet from '../wallet-connector';

const tempEmptyText = (
  <p>{t('Please select a market from the markets page')}</p>
);

const PARTY_BALANCE_QUERY = gql`
  query PartyBalanceQuery($partyId: ID!) {
    party(id: $partyId) {
      accounts {
        type
        balance
        asset {
          id
          symbol
          name
          decimals
        }
      }
    }
  }
`;

export const DealTicketContainer = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const { keypair } = useVegaWallet();

  const { data: partyData, loading } = useQuery<PartyBalanceQuery>(
    PARTY_BALANCE_QUERY,
    {
      variables: { partyId: keypair?.pub },
      skip: !keypair?.pub,
    }
  );

  const loader = <Loader />;

  const container = marketId ? (
    <Container marketId={marketId}>
      {(data) => {
        if (!data.market) {
          return <></>;
        }

        const balance = (
          <DealTicketBalance
            className="mb-4"
            settlementAsset={
              data.market.tradableInstrument.instrument.product?.settlementAsset
            }
            accounts={partyData?.party?.accounts || []}
            isWalletConnected={!!keypair?.pub}
          />
        );

        return (
          <DealTicketManager market={data.market}>
            {loading ? loader : balance}
            <DealTicketSteps market={data.market} partyData={partyData} />
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
        {keypair ? container : <ConnectWallet />}
      </section>
      <Baubles />
    </section>
  );
};
