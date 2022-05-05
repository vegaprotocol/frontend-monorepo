import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { gql, useQuery } from '@apollo/client';
import type { DealTicketQuery } from '@vegaprotocol/deal-ticket';
import { DealTicketManager } from '@vegaprotocol/deal-ticket';
import { t } from '@vegaprotocol/react-helpers';
import { DealTicketSteps } from './deal-ticket-steps';

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
      {data && data.market ? (
        <DealTicketManager market={data.market}>
          <DealTicketSteps market={data.market} />
        </DealTicketManager>
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};
