import { gql } from '@apollo/client';
import uniqBy from 'lodash/uniqBy';
import { t } from '@vegaprotocol/react-helpers';
import { AnchorButton, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { PageQueryContainer } from '../../../components/page-query-container';
import { Web3Container } from '../../../components/web3-container';
import { WithdrawalsList } from './withdrawals-list';
import type {
  WithdrawalEvent,
  WithdrawalEventVariables,
  WithdrawalEvent_busEvents_event,
  WithdrawalEvent_busEvents_event_Withdrawal,
} from './__generated__/WithdrawalEvent';
import type {
  WithdrawalsPageQuery,
  WithdrawalsPageQueryVariables,
} from './__generated__/WithdrawalsPageQuery';

const WITHDRAWAL_FRAGMENT = gql`
  fragment WithdrawalFields on Withdrawal {
    id
    status
    amount
    asset {
      id
      symbol
      decimals
    }
    createdTimestamp
    withdrawnTimestamp
    txHash
    details {
      ... on Erc20WithdrawalDetails {
        receiverAddress
      }
    }
    pendingOnForeignChain @client
  }
`;

const WITHDRAWALS_PAGE_QUERY = gql`
  ${WITHDRAWAL_FRAGMENT}
  query WithdrawalsPageQuery($partyId: ID!) {
    party(id: $partyId) {
      id
      withdrawals {
        ...WithdrawalFields
      }
    }
  }
`;

export const WITHDRAWAL_BUS_EVENT_SUB = gql`
  ${WITHDRAWAL_FRAGMENT}
  subscription WithdrawalEvent($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Withdrawal]) {
      event {
        ... on Withdrawal {
          ...WithdrawalFields
        }
      }
    }
  }
`;

const Withdraws = () => {
  const { keypair } = useVegaWallet();

  if (!keypair) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

  return (
    <Web3Container>
      {() => (
        <PageQueryContainer<WithdrawalsPageQuery, WithdrawalsPageQueryVariables>
          query={WITHDRAWALS_PAGE_QUERY}
          options={{
            variables: { partyId: keypair?.pub || '' },
            skip: !keypair?.pub,
          }}
        >
          {(data, { subscribeToMore }) => {
            return (
              <div className="h-full grid grid grid-rows-[min-content,1fr]">
                <header className="flex justify-between p-24">
                  <h1 className="text-h3">{t('Withdrawals')}</h1>
                  <AnchorButton href="/portfolio/withdraw">
                    {t('Start withdrawal')}
                  </AnchorButton>
                </header>
                <WithdrawalsList
                  withdrawals={data.party?.withdrawals || []}
                  subscribe={() => {
                    subscribeToMore<WithdrawalEvent, WithdrawalEventVariables>({
                      document: WITHDRAWAL_BUS_EVENT_SUB,
                      variables: { partyId: keypair.pub },
                      updateQuery: (prev, { subscriptionData }) => {
                        if (!subscriptionData.data.busEvents?.length) {
                          return prev;
                        }

                        const curr = prev.party?.withdrawals || [];
                        const incoming = subscriptionData.data.busEvents
                          .map((e) => {
                            return {
                              ...e.event,
                              pendingOnForeignChain: false,
                            };
                          })
                          .filter(
                            isWithdrawalEvent
                            // Need this type cast here, TS can't infer that we've filtered any event types
                            // that arent Withdrawals
                          ) as WithdrawalEvent_busEvents_event_Withdrawal[];

                        const withdrawals = uniqBy(
                          [...incoming, ...curr],
                          'id'
                        );

                        // Write new party to cache if not present
                        if (!prev.party) {
                          return {
                            ...prev,
                            party: {
                              __typename: 'Party',
                              id: keypair.pub,
                              withdrawals,
                            },
                          };
                        }

                        return {
                          ...prev,
                          party: {
                            ...prev.party,
                            withdrawals,
                          },
                        };
                      },
                    });
                  }}
                />
              </div>
            );
          }}
        </PageQueryContainer>
      )}
    </Web3Container>
  );
};

export default Withdraws;

const isWithdrawalEvent = (
  event: WithdrawalEvent_busEvents_event
): event is WithdrawalEvent_busEvents_event_Withdrawal => {
  if (event.__typename === 'Withdrawal') {
    return true;
  }

  return false;
};
