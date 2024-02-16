import { AsyncRenderer, Icon } from '@vegaprotocol/ui-toolkit';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useDocumentTitle } from '../../hooks/use-document-title';
import {
  type ExplorerTreasuryQuery,
  useExplorerTreasuryQuery,
} from './__generated__/Treasury';
import AssetBalance from '../../components/asset-balance/asset-balance';
import { AccountType, AccountTypeMapping } from '@vegaprotocol/types';
import { AssetLink, PartyLink } from '../../components/links';
import {
  type ExplorerTreasuryTransfersQuery,
  useExplorerTreasuryTransfersQuery,
} from './__generated__/TreasuryTransfers';
import { TimeAgo } from '../../components/time-ago';
import { TransferStatusIcon } from '../../components/txs/details/transfer/blocks/transfer-status';
import { t } from '@vegaprotocol/i18n';
import { IconNames } from '@blueprintjs/icons';
import { RouteTitle } from '../../components/route-title';
import { useMemo } from 'react';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { AssetIcon } from './components/asset-icon';

type NonZeroAccount = {
  assetId: string;
  balance: string;
  type: AccountType;
};

function parseResultsToAccounts(data: ExplorerTreasuryQuery): NonZeroAccount[] {
  const nonZeroAccounts: NonZeroAccount[] = [];
  if (data?.assetsConnection?.edges) {
    const edges = removePaginationWrapper(data?.assetsConnection?.edges);
    if (edges) {
      edges.forEach((edge) => {
        if (
          edge.networkTreasuryAccount &&
          edge.networkTreasuryAccount?.balance !== '0'
        ) {
          nonZeroAccounts.push({
            assetId: edge.id,
            balance: edge.networkTreasuryAccount?.balance,
            type: AccountType.ACCOUNT_TYPE_NETWORK_TREASURY,
          });
        }
      });
    }
  }

  return nonZeroAccounts;
}

export const NetworkAccountsTable = () => {
  const { data, loading, error } = useExplorerTreasuryQuery({
    // This needs to ignore error as old assets may no longer properly resolve
    errorPolicy: 'ignore',
  });
  const { screenSize } = useScreenDimensions();
  const shouldRound = useMemo(
    () => ['xs', 'sm', 'md', 'lg'].includes(screenSize),
    [screenSize]
  );

  return (
    <AsyncRenderer
      data={data}
      loading={loading}
      error={error}
      render={(data) => {
        const c = parseResultsToAccounts(data);
        return (
          <section className="md:flex md:flex-row flex-wrap">
            {c.map((a) => (
              <div className="basis-1/2 md:basis-1/4">
                <div className="bg-white rounded overflow-hidden shadow-lg dark:bg-black dark:border-slate-500 dark:border">
                  <div className="text-center p-6 bg-gray-100 dark:bg-slate-900 border-b dark:border-slate-500">
                    <p className="flex justify-center">
                      <AssetIcon symbol={a.assetId} />
                    </p>
                    <p className="mt-3">
                      <AssetLink assetId={a.assetId} />
                    </p>
                  </div>
                  <div className="text-center py-5">
                    <AssetBalance
                      assetId={a.assetId}
                      price={a.balance}
                      showAssetSymbol={true}
                      rounded={shouldRound}
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>
        );
      }}
    />
  );
};

export function filterAccountTransfers(data: ExplorerTreasuryTransfersQuery) {
  return data.transfersConnection?.edges
    ?.filter((edge) => {
      if (
        edge?.node.transfer.toAccountType ===
        AccountType.ACCOUNT_TYPE_NETWORK_TREASURY
      ) {
        return true;
      } else if (
        edge?.node.transfer.fromAccountType ===
        AccountType.ACCOUNT_TYPE_NETWORK_TREASURY
      ) {
        return true;
      }

      return false;
    })
    .map((edge) => {
      return edge?.node.transfer;
    });
}

const colours = {
  INCOMING: '!fill-vega-green-600 text-vega-green-600 mr-2',
  OUTGOING: '!fill-vega-pink-600 text-vega-pink-600 mr-2',
};

const theadClasses =
  'py-2 border text-center bg-vega-light-150 dark:bg-vega-dark-150';

export const NetworkTransfersTable = () => {
  const { data, loading, error } = useExplorerTreasuryTransfersQuery({
    // This needs to ignore error as old assets may no longer properly resolve
    errorPolicy: 'ignore',
  });

  const { screenSize } = useScreenDimensions();
  const shouldRound = useMemo(
    () => ['xs', 'sm', 'md', 'lg'].includes(screenSize),
    [screenSize]
  );
  const shouldTruncate = useMemo(
    () => ['xs', 'sm', 'md', 'lg', 'xl'].includes(screenSize),
    [screenSize]
  );
  const shouldHideColumns = useMemo(
    () => ['xs', 'sm'].includes(screenSize),
    [screenSize]
  );

  return (
    <section>
      <AsyncRenderer
        data={data}
        loading={loading}
        error={error}
        render={(data) => {
          const c = filterAccountTransfers(data);
          if (!c) {
            return null;
          }
          return (
            <table className="table-fixed border-spacing-3">
              <thead>
                <tr>
                  <th className={theadClasses}>Amount</th>
                  <th className={theadClasses}>Asset</th>
                  <th className={theadClasses}>Age</th>
                  <th className={theadClasses}>From</th>
                  <th className={theadClasses}>To</th>
                  <th
                    className={`${theadClasses} ${
                      shouldHideColumns ? 'hidden' : ''
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`${theadClasses} ${
                      shouldHideColumns ? 'hidden' : ''
                    }`}
                  >
                    Trigger
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.map((a) => {
                  const isIncoming =
                    a?.toAccountType ===
                    AccountType.ACCOUNT_TYPE_NETWORK_TREASURY;
                  return (
                    <tr>
                      {a && a.amount && a.asset && (
                        <td
                          className={`px-2 py-1 border whitespace-nowrap text-right ${
                            isIncoming ? colours.INCOMING : colours.OUTGOING
                          }`}
                          title={a.amount}
                        >
                          {a &&
                          a.toAccountType ===
                            AccountType.ACCOUNT_TYPE_NETWORK_TREASURY ? (
                            <Icon
                              name={IconNames.PLUS}
                              className={colours.INCOMING}
                            />
                          ) : (
                            <Icon
                              name={IconNames.MINUS}
                              className={colours.OUTGOING}
                            />
                          )}
                          <AssetBalance
                            assetId={a.asset.id}
                            price={a.amount}
                            showAssetLink={false}
                            rounded={shouldRound}
                          />
                        </td>
                      )}
                      <td className="px-2 py-1 border whitespace-nowrap">
                        {a && a.amount && a.asset && (
                          <AssetLink
                            assetId={a.asset.id}
                            showAssetSymbol={true}
                          />
                        )}
                      </td>
                      <td className="px-2 py-1 border">
                        {a && a.timestamp && <TimeAgo date={a.timestamp} />}
                      </td>
                      <td className="px-2 py-1 border">
                        {a && a.from && (
                          <PartyLink
                            id={a.from}
                            truncate={true}
                            truncateLength={shouldTruncate ? 4 : 15}
                            networkLabel={t('Treasury')}
                          />
                        )}
                      </td>
                      <td className="px-2 py-1 border">
                        {a && a.to && (
                          <PartyLink
                            id={a.to}
                            networkLabel={t('Treasury')}
                            truncate={true}
                            truncateLength={shouldTruncate ? 4 : 15}
                          />
                        )}
                        {a && !a.to && (
                          <span
                            className="underline decoration-dotted"
                            title={AccountTypeMapping[a.toAccountType]}
                          >
                            {getToAccountTypeLabel(a.toAccountType)}
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-2 py-1 border text-center ${
                          shouldHideColumns ? 'hidden' : ''
                        }`}
                      >
                        {a && a.status && (
                          <TransferStatusIcon status={a.status} />
                        )}
                      </td>
                      <td
                        className={`px-2 py-1 border ${
                          shouldHideColumns ? 'hidden' : ''
                        }`}
                      >
                        <span
                          className="underline decoration-dotted"
                          title={a?.kind.__typename}
                        >
                          {a && typeLabel(a.kind.__typename)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        }}
      />
    </section>
  );
};

export function getToAccountTypeLabel(type?: AccountType): string {
  switch (type) {
    case AccountType.ACCOUNT_TYPE_NETWORK_TREASURY:
      return t('Treasury');
    case AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE:
    case AccountType.ACCOUNT_TYPE_FEES_MAKER:
    case AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY:
    case AccountType.ACCOUNT_TYPE_LP_LIQUIDITY_FEES:
    case AccountType.ACCOUNT_TYPE_PENDING_FEE_REFERRAL_REWARD:
      return t('Fees');
    case AccountType.ACCOUNT_TYPE_GLOBAL_INSURANCE:
      return t('Insurance');
    case AccountType.ACCOUNT_TYPE_GLOBAL_REWARD:
    case AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION:
    case AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES:
    case AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES:
    case AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES:
    case AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS:
    case AccountType.ACCOUNT_TYPE_REWARD_RELATIVE_RETURN:
    case AccountType.ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY:
    case AccountType.ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING:
    case AccountType.ACCOUNT_TYPE_VESTED_REWARDS:
    case AccountType.ACCOUNT_TYPE_VESTING_REWARDS:
      return t('Rewards');
    default:
      return t('Other');
  }
}

export function typeLabel(kind?: string): string {
  switch (kind) {
    case 'OneOffTransfer':
    case 'RecurringTransfer':
      return t('Transfer');
    case 'OneOffGovernanceTransfer':
    case 'RecurringGovernanceTransfer':
      return t('Governance');
    default:
      return t('Unknown');
  }
}

export const NetworkTreasury = () => {
  useDocumentTitle(['Network Treasury']);
  return (
    <section>
      <RouteTitle data-testid="block-header">{t(`Treasury`)}</RouteTitle>
      <div>
        <NetworkAccountsTable />
      </div>
      <div className="mt-5">
        <h2 className="text-3xl mb-2">{t('Transfers')}</h2>
        <NetworkTransfersTable />
      </div>
    </section>
  );
};
