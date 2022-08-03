import { gql, useQuery } from '@apollo/client';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { DealTicketManager } from './deal-ticket-manager';
import { t } from '@vegaprotocol/react-helpers';
import type { DealTicketQuery_market, DealTicketQuery } from './__generated__';

const DEAL_TICKET_QUERY = gql`
  query DealTicketQuery($marketId: ID!) {
    market(id: $marketId) {
      id
      name
      decimalPlaces
      positionDecimalPlaces
      state
      tradingMode
      tradableInstrument {
        instrument {
          product {
            ... on Future {
              quoteName
              settlementAsset {
                id
                symbol
                name
              }
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
