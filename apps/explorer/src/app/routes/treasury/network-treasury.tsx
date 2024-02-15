import {
  AsyncRenderer,
  Icon,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
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

  return (
    <AsyncRenderer
      data={data}
      loading={loading}
      error={error}
      render={(data) => {
        const c = parseResultsToAccounts(data);
        return (
          <section>
            {c.map((a) => (
              <p>
                <span>
                  <AssetBalance
                    assetId={a.assetId}
                    price={a.balance}
                    showAssetSymbol={true}
                  />
                </span>
              </p>
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
                  <th className={theadClasses}>Status</th>
                  <th className={theadClasses}>Trigger</th>
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
                          className={`px-2 py-1 border text-right ${
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
                            rounded={true}
                          />
                        </td>
                      )}
                      {a && a.amount && a.asset && (
                        <td className="px-2 py-1 border">
                          <AssetLink
                            assetId={a.asset.id}
                            showAssetSymbol={true}
                          />
                        </td>
                      )}
                      {a && a.timestamp && (
                        <td className="px-2 py-1 border">
                          <TimeAgo date={a.timestamp} />
                        </td>
                      )}
                      {a && a.from && (
                        <td className="px-2 py-1 border">
                          <PartyLink
                            id={a.from}
                            truncate={true}
                            networkLabel={t('Treasury')}
                          />
                        </td>
                      )}
                      {a && !a.to && (
                        <td className="px-2 py-1 border">
                          {AccountTypeMapping[a.toAccountType]}
                        </td>
                      )}
                      {a && a.to && (
                        <td className="px-2 py-1 border">
                          <PartyLink id={a.to} networkLabel={t('Treasury')} />
                        </td>
                      )}
                      {a && a.status && (
                        <td className="px-2 py-1 border text-center">
                          <TransferStatusIcon status={a.status} />
                        </td>
                      )}
                      {a && (
                        <td
                          className="px-2 py-1 border"
                          title={a.kind.__typename}
                        >
                          {typeLabel(a.kind.__typename)}
                        </td>
                      )}
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
    <>
      <section>
        <h2 className="text-lg">{t('Treasury balances')}</h2>
        <NetworkAccountsTable />
      </section>
      <section className="mt-5">
        <h2 className="text-lg">
          <VegaIcon name={VegaIconNames.TRANSFER} /> {t('Transfers')}
        </h2>
        <NetworkTransfersTable />
      </section>
    </>
  );
};
