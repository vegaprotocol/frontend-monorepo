import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { gql, useQuery } from '@apollo/client';
import { DealTicketManager } from './deal-ticket-manager';
import type { DealTicketQuery } from './__generated__/DealTicketQuery';
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

interface DealTicketContainerProps {
  marketId: string;
}

export const DealTicketContainer = ({ marketId }: DealTicketContainerProps) => {
  const { data, loading, error } = useQuery(DEAL_TICKET_QUERY, {
    variables: { marketId },
  });

  return (
    <AsyncRenderer<DealTicketQuery> data={data} loading={loading} error={error}>
      {(data) => {
        if (!data.market) {
          return (
            <Splash>
              <p>{t('Could not load market')}</p>
            </Splash>
          );
        }
        return <DealTicketManager market={data.market} />;
      }}
    </AsyncRenderer>
  );
};
