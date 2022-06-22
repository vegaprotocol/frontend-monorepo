import { gql, useQuery } from '@apollo/client';
import { AsyncRenderer, Tab, Tabs, Splash } from '@vegaprotocol/ui-toolkit';
import { DealTicketManager } from './deal-ticket-manager';
import { t } from '@vegaprotocol/react-helpers';
import { Info } from './info-market';
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
      fees {
        factors {
          makerFee
          infrastructureFee
          liquidityFee
        }
      }
      priceMonitoringSettings {
        parameters {
          triggers {
            horizonSecs
            probability
            auctionExtensionSecs
          }
        }
        updateFrequencySecs
      }
      riskFactors {
        market
        short
        long
      }
      data {
        market {
          id
        }
        markPrice
        indicativeVolume
        bestBidVolume
        bestOfferVolume
        bestStaticBidVolume
        bestStaticOfferVolume
        indicativeVolume
      }
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
        riskModel {
          ... on LogNormalRiskModel {
            tau
            riskAversionParameter
            params {
              r
              sigma
              mu
            }
          }
          ... on SimpleRiskModel {
            params {
              factorLong
              factorShort
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
    <Tabs>
      <Tab id="ticket" name={t('Ticket')}>
        <AsyncRenderer<DealTicketQuery>
          data={data}
          loading={loading}
          error={error}
        >
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
      </Tab>
      <Tab id="info" name={t('Info')}>
        <AsyncRenderer<DealTicketQuery>
          data={data}
          loading={loading}
          error={error}
        >
          {data && data.market ? (
            children ? (
              children(data)
            ) : (
              <Info market={data.market} />
            )
          ) : (
            <Splash>
              <p>{t('Could not load market')}</p>
            </Splash>
          )}
        </AsyncRenderer>
      </Tab>
    </Tabs>
  );
};
