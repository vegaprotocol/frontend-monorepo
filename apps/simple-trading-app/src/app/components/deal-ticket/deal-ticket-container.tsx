import * as React from 'react';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import {
  DealTicketManager,
  DealTicketContainer as Container,
} from '@vegaprotocol/deal-ticket';
import { Button, Loader } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { DealTicketSteps } from './deal-ticket-steps';
import { DealTicketBalance } from './deal-ticket-balance';
import Baubles from './baubles-decor';
import LocalContext from '../../context/local-context';
import type { PartyBalanceQuery } from './__generated__/PartyBalanceQuery';

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
  const {
    vegaWalletDialog: { setConnect },
  } = useContext(LocalContext);

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
        const balance = (
          <DealTicketBalance
            className="mb-16"
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

  const connectWallet = (
    <section
      className="p-32 bg-white-normal dark:bg-offBlack"
      data-testid="trading-connect-wallet"
    >
      <h3 className="mb-16 text-2xl text-offBlack dark:text-white">
        {t('Please connect your Vega wallet to make a trade')}
      </h3>
      <Button
        variant="primary"
        onClick={() => setConnect(true)}
        className="h-[50px] mb-16"
      >
        {t('Connect Vega wallet')}
      </Button>
      <h4 className="text-lg text-offBlack dark:text-white">
        {t("Don't have a wallet?")}
      </h4>
      <p>
        {t('Head over to ')}
        <a className="text-blue" href="https://vega.xyz/wallet">
          https://vega.xyz/wallet
        </a>
        {t(' and follow the steps to create one.')}
      </p>
    </section>
  );

  return (
    <section className="flex">
      <section className="w-full md:w-1/2 md:min-w-[500px]">
        {keypair ? container : connectWallet}
      </section>
      <Baubles />
    </section>
  );
};
