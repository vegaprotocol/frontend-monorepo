import {
  Intent,
  Notification,
  Tooltip,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

import { DataTable } from '@/components/data-table';
import { ExternalLink } from '@/components/external-link';
import { SubHeader } from '@/components/sub-header';
import { VegaSection } from '@/components/vega-section';
import { useNetwork } from '@/contexts/network/network-context';
import { formatDateTime } from '@/lib/utils';
import type { StoredTransaction } from '@/types/backend';

import { VegaTransactionState } from '../transactions-state';

export const locators = {
  transactionMetadataPublicKey: 'transaction-metadata-public-key',
  transactionMetadataHash: 'transaction-metadata-hash',
  transactionMetadataNetwork: 'transaction-metadata-network',
  transactionMetadataNode: 'transaction-metadata-node',
  transactionMetadataOrigin: 'transaction-metadata-origin',
  transactionMetadataSent: 'transaction-metadata-sent',
  transactionMetadataAutomaticallyConfirmed:
    'transaction-metadata-automatically-confirmed',
};

interface TransactionSectionProperties {
  transaction: StoredTransaction;
}

export const TransactionMetadata = ({
  transaction,
}: TransactionSectionProperties) => {
  const { explorer } = useNetwork();
  const cols = [
    [
      'From',
      <ExternalLink
        data-testid={locators.transactionMetadataPublicKey}
        key="transaction-details-public-key"
        className="text-surface-0-fg-muted"
        href={`${explorer}/parties/${transaction.publicKey}`}
      >
        {truncateMiddle(transaction.publicKey)}
      </ExternalLink>,
    ],
    transaction.hash
      ? [
          'Hash',
          <ExternalLink
            data-testid={locators.transactionMetadataHash}
            key="transaction-details-hash"
            href={`${explorer}/txs/${transaction.hash}`}
          >
            {truncateMiddle(transaction.hash)}
          </ExternalLink>,
        ]
      : null,
    [
      'Node',
      <ExternalLink
        data-testid={locators.transactionMetadataNode}
        key="transaction-details-node"
        href={transaction.node}
      >
        {transaction.node}
      </ExternalLink>,
    ],
    [
      'Sent',
      <div
        key="transaction-details-sent"
        data-testid={locators.transactionMetadataSent}
      >
        {formatDateTime(new Date(transaction.receivedAt).getTime())}
      </div>,
    ],
    [
      'Automatically Confirmed',
      <div
        key="transaction-details-automatically-confirmed"
        data-testid={locators.transactionMetadataAutomaticallyConfirmed}
      >
        <Tooltip
          description={
            <span style={{ maxWidth: 300 }}>
              The auto consent setting can be found and changed under
              Connections.
            </span>
          }
        >
          <span>
            {transaction.autoApproved === undefined
              ? '-'
              : transaction.autoApproved
              ? '👍'
              : '👎'}
          </span>
        </Tooltip>
      </div>,
    ],
  ].filter(Boolean) as [ReactNode, ReactNode][];

  return (
    <VegaSection>
      <div className="mb-2">
        <VegaTransactionState state={transaction.state} />
        {transaction.error && (
          <Notification intent={Intent.Danger} message={transaction.error} />
        )}
      </div>
      <SubHeader content="Transaction Details" />
      <div className="mt-2">
        <DataTable items={cols} />
      </div>
    </VegaSection>
  );
};
