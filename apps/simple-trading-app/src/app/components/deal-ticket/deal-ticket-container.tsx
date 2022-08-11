import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  DealTicketManager,
  DealTicketContainer as Container,
} from '@vegaprotocol/deal-ticket';
import { DealTicketSteps } from './deal-ticket-steps';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { gql, useQuery } from '@apollo/client';
import { DealTicketBalance } from './deal-ticket-balance';
import type { PartyBalanceQuery } from './__generated__/PartyBalanceQuery';
import Baubles from './baubles-decor';

const tempEmptyText = <p>Please select a market from the markets page</p>;

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

  return (
    <div className="flex">
      <div className="w-full md:w-1/2 md:min-w-[500px]">
        {marketId ? (
          <Container marketId={marketId}>
            {(data) => (
              <DealTicketManager market={data.market}>
                {loading ? (
                  'Loading...'
                ) : (
                  <DealTicketBalance
                    className="mb-16"
                    settlementAsset={
                      data.market.tradableInstrument.instrument.product
                        ?.settlementAsset
                    }
                    accounts={partyData?.party?.accounts || []}
                    isWalletConnected={!!keypair?.pub}
                  />
                )}
                <DealTicketSteps market={data.market} partyData={partyData} />
              </DealTicketManager>
            )}
          </Container>
        ) : (
          tempEmptyText
        )}
      </div>
      <Baubles />
    </div>
  );
};
