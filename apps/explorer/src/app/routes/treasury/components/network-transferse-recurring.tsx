import { Icon } from '@vegaprotocol/ui-toolkit';
import AssetBalance from '../../../components/asset-balance/asset-balance';
import { AccountType, AccountTypeMapping } from '@vegaprotocol/types';
import { AssetLink, PartyLink } from '../../../components/links';
import { TransferStatusIcon } from '../../../components/txs/details/transfer/blocks/transfer-status';
import { t } from '@vegaprotocol/i18n';
import { IconNames } from '@blueprintjs/icons';
import { useMemo } from 'react';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import ProposalLink from '../../../components/links/proposal-link/proposal-link';
import type { ExplorerTreasuryTransfersQuery } from '../__generated__/TreasuryTransfers';
import {
  colours,
  getToAccountTypeLabel,
  isGovernanceTransfer,
  typeLabel,
} from './network-transfers-table';
import { theadClasses } from './network-transfers-table';
import EpochOverview from '../../../components/epoch-overview/epoch';
export const RECURRING_TRANSFER_KINDS = [
  'RecurringGovernanceTransfer',
  'RecurringTransfer',
];

export enum EpochType {
  Start = 'start',
  End = 'end',
}

export function filterRecurringTransfers(
  transfers: ExplorerTreasuryTransfersQuery
) {
  return transfers?.transfersConnection?.edges
    ?.filter((edge) => {
      const t = edge?.node?.transfer;
      return (
        RECURRING_TRANSFER_KINDS.includes(t?.kind?.__typename || '') &&
        (t?.toAccountType === AccountType.ACCOUNT_TYPE_NETWORK_TREASURY ||
          t?.fromAccountType === AccountType.ACCOUNT_TYPE_NETWORK_TREASURY)
      );
    })
    .map((edge) => edge?.node.transfer);
}

export type NetworkTransfersTableRecurringProps = {
  transfers: ExplorerTreasuryTransfersQuery;
};

export const NetworkTransfersTableRecurring = ({
  transfers,
}: NetworkTransfersTableRecurringProps) => {
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

  const ts = filterRecurringTransfers(transfers);

  return (
    <table className="table-fixed border-spacing-3">
      <thead>
        <tr>
          <th className={theadClasses}>{t('Amount')}</th>
          <th className={theadClasses}>{t('Asset')}</th>
          <th className={theadClasses}>{t('From epoch')}</th>
          <th className={theadClasses}>{t('To epoch')}</th>
          <th className={theadClasses}>{t('From')}</th>
          <th className={theadClasses}>{t('To')}</th>
          <th
            className={`${theadClasses} ${shouldHideColumns ? 'hidden' : ''}`}
          >
            {t('Status')}
          </th>
          <th
            className={`${theadClasses} ${shouldHideColumns ? 'hidden' : ''}`}
          >
            {t('Type')}
          </th>
        </tr>
      </thead>
      <tbody>
        {ts &&
          ts.map((a) => {
            const isIncoming =
              a?.toAccountType === AccountType.ACCOUNT_TYPE_NETWORK_TREASURY;

            const startEpoch =
              a &&
              a.kind &&
              (a.kind.__typename === 'RecurringTransfer' ||
                a.kind.__typename === 'RecurringGovernanceTransfer') &&
              a.kind.endEpoch
                ? a.kind.endEpoch.toString()
                : '-';
            const endEpoch =
              a &&
              a.kind &&
              (a.kind.__typename === 'RecurringTransfer' ||
                a.kind.__typename === 'RecurringGovernanceTransfer') &&
              a.kind.startEpoch
                ? a.kind.startEpoch.toString()
                : '-';

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
                    <AssetLink assetId={a.asset.id} showAssetSymbol={true} />
                  )}
                </td>
                <td className="px-2 py-1 border">
                  <EpochOverview id={startEpoch} />
                </td>
                <td className="px-2 py-1 border">
                  <EpochOverview id={endEpoch} />
                </td>
                <td className="px-2 py-1 border" data-testid="from-account">
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
                  {a && a.status && <TransferStatusIcon status={a.status} />}
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
};
