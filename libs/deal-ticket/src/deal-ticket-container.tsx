import type { ReactElement } from 'react';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { gql, useQuery } from '@apollo/client';
import { DealTicketManager } from './deal-ticket-manager';
import type {
  DealTicketQuery,
  DealTicketQuery_market,
} from './__generated__/DealTicketQuery';
import { t } from '@vegaprotocol/react-helpers';

const DEAL_TICKET_QUERY = gql`
  query DealTicketQuery($marketId: ID!) {
    market(id: $marketId) {
      id
      decimalPlaces
      state
      tradingMode
      tradableInstrument {
        instrument {
          product {
            ... on Future {
              quoteName
            }
          }
        }
      }
      depth {
        lastTrade {
          price
        }
      }
    }
  }
`;

type childrenProps = {
  market: DealTicketQuery_market;
};

export interface DealTicketContainerProps {
  marketId: string;
  children?(props: childrenProps): JSX.Element;
}

export const DealTicketContainer = ({
  marketId,
  children,
}: DealTicketContainerProps) => {
  const { data, loading, error } = useQuery(DEAL_TICKET_QUERY, {
    variables: { marketId },
  });

  return (
    <AsyncRenderer<DealTicketQuery> data={data} loading={loading} error={error}>
      {data && data.market ? (
        children ? (
          children(data)
        ) : (
          <DealTicketManager market={data.market} />
        )
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};
