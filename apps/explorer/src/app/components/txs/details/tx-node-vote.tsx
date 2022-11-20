import React from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableWithTbody } from '../../table';
import type { ExplorerNodeVoteQueryResult } from './__generated___/node-vote';
import { useExplorerNodeVoteQuery } from './__generated___/node-vote';
import { PartyLink } from '../../links';

interface TxDetailsNodeVoteProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * If there is not yet a custom component for a transaction, just display
 * the basic details. This allows someone to view the decoded transaction.
 */
export const TxDetailsNodeVote = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsNodeVoteProps) => {
  const id = txData?.command.nodeVote?.reference || '';

  const { data } = useExplorerNodeVoteQuery({
    variables: {
      id,
    },
    // Required as one of these queries will needlessly error
    errorPolicy: 'ignore',
  });

  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <>
      <TableWithTbody>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
      </TableWithTbody>

      <h2>{t('Node witnessed chain event:')}</h2>
      {data && !!data.deposit
        ? TxDetailsNodeVoteDeposit({ deposit: data })
        : data && !!data.withdrawal
        ? TxDetailsNodeVoteWithdrawal({ withdrawal: data })
        : null}
    </>
  );
};

interface TxDetailsNodeVoteDepositProps {
  deposit: ExplorerNodeVoteQueryResult['data'];
}

export function TxDetailsNodeVoteDeposit({
  deposit,
}: TxDetailsNodeVoteDepositProps) {
  if (!deposit) {
    return null;
  }
  return (
    <dl>
      <dt>Deposit from eth:</dt>
      <dd>{deposit?.deposit?.party?.id}</dd>
      <dt>To party:</dt>
      <dd>
        <PartyLink id={deposit?.deposit?.party?.id || ''} />
      </dd>
      <dt>Credited on:</dt>
      <dd>{deposit?.deposit?.creditedTimestamp}</dd>
    </dl>
  );
}

interface TxDetailsNodeVoteWithdrawalProps {
  withdrawal: ExplorerNodeVoteQueryResult['data'];
}
export function TxDetailsNodeVoteWithdrawal({
  withdrawal,
}: TxDetailsNodeVoteWithdrawalProps) {
  if (!withdrawal) {
    return null;
  }
  return (
    <dl>
      <dt>Withdrawal to eth:</dt>
      <dd>{withdrawal?.withdrawal?.party?.id}</dd>
      <dt>To party:</dt>
      <dd>
        <PartyLink id={withdrawal?.deposit?.party?.id || ''} />
      </dd>
      <dt>Withdrawn on:</dt>
      <dd>{withdrawal?.withdrawal?.withdrawnTimestamp}</dd>
    </dl>
  );
}
