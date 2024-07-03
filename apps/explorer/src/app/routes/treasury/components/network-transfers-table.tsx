import { AsyncRenderer, Icon } from '@vegaprotocol/ui-toolkit';
import { AssetBalance } from '../../../components/asset-balance/asset-balance';
import { AccountType, AccountTypeMapping } from '@vegaprotocol/types';
import { AssetLink, PartyLink } from '../../../components/links';
import {
  type ExplorerTreasuryTransfersQuery,
  useExplorerTreasuryTransfersQuery,
} from '../__generated__/TreasuryTransfers';
import { TimeAgo } from '../../../components/time-ago';
import { TransferStatusIcon } from '../../../components/txs/details/transfer/blocks/transfer-status';
import { t } from '@vegaprotocol/i18n';
import { IconNames } from '@blueprintjs/icons';
import { useMemo } from 'react';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { ProposalLink } from '../../../components/links/proposal-link/proposal-link';

export const colours = {
  INCOMING: '!fill-vega-green-600 text-vega-green-600 mr-2',
  OUTGOING: '!fill-vega-pink-600 text-vega-pink-600 mr-2',
};

export const theadClasses =
  'py-2 border text-center bg-vega-light-150 dark:bg-vega-dark-150';

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

export function isGovernanceTransfer(kind?: string): boolean {
  if (kind && kind.includes('Governance')) {
    return true;
  }

  return false;
}

export function typeLabel(kind?: string): string {
  switch (kind) {
    case 'OneOffTransfer':
      return t('Transfer - one time');
    case 'RecurringTransfer':
      return t('Transfer - repeating');
    case 'OneOffGovernanceTransfer':
      return t('Governance - one time');
    case 'RecurringGovernanceTransfer':
      return t('Governance - repeating');
    default:
      return t('Unknown');
  }
}

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
                  <th className={theadClasses}>{t('Amount')}</th>
                  <th className={theadClasses}>{t('Asset')}</th>
                  <th className={theadClasses}>{t('Age')}</th>
                  <th className={theadClasses}>{t('From')}</th>
                  <th className={theadClasses}>{t('To')}</th>
                  <th
                    className={`${theadClasses} ${
                      shouldHideColumns ? 'hidden' : ''
                    }`}
                  >
                    {t('Status')}
                  </th>
                  <th
                    className={`${theadClasses} ${
                      shouldHideColumns ? 'hidden' : ''
                    }`}
                  >
                    {t('Type')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.map((a) => {
                  const isIncoming =
                    a?.toAccountType ===
                    AccountType.ACCOUNT_TYPE_NETWORK_TREASURY;
                  const deliverOn =
                    a?.kind.__typename === 'OneOffTransfer' ||
                    a?.kind.__typename === 'OneOffGovernanceTransfer'
                      ? a.kind.deliverOn
                      : undefined;
                  return (
                    <tr key={a?.id}>
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
                      <td
                        className="px-2 py-1 border"
                        data-testid="from-account"
                      >
                        {a && a.from && (
                          <PartyLink
                            id={a.from}
                            truncate={true}
                            truncateLength={shouldTruncate ? 4 : 15}
                            networkLabel={t('Treasury')}
                          />
                        )}
                      </td>
                      <td className="px-2 py-1 border" data-testid="to-account">
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
                          <TransferStatusIcon
                            status={a.status}
                            deliverOn={deliverOn}
                          />
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
                          data-testid="transfer-kind"
                        >
                          {a && typeLabel(a.kind.__typename)}
                        </span>
                        {isGovernanceTransfer(a?.kind.__typename) && a?.id && (
                          <span className="ml-4">
                            <ProposalLink id={a?.id} text="View" />
                          </span>
                        )}
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
