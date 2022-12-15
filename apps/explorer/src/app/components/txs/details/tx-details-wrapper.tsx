import { useMemo } from 'react';
import { DATA_SOURCES } from '../../../config';
import { t, useFetch } from '@vegaprotocol/react-helpers';
import { TxDetailsOrder } from './tx-order';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsHeartbeat } from './tx-hearbeat';
import { TxDetailsLPAmend } from './tx-lp-amend';
import { TxDetailsGeneric } from './tx-generic';
import { TxDetailsBatch } from './tx-batch';
import { TxDetailsChainEvent } from './tx-chain-event';
import { TxContent } from '../../../routes/txs/id/tx-content';
import { TxDetailsNodeVote } from './tx-node-vote';
import { TxDetailsOrderCancel } from './tx-order-cancel';
import get from 'lodash/get';
import { TxDetailsOrderAmend } from './tx-order-amend';
import { TxDetailsWithdrawSubmission } from './tx-withdraw-submission';
import { TxDetailsDelegate } from './tx-delegation';
import { TxDetailsUndelegate } from './tx-undelegation';

interface TxDetailsWrapperProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  height: string;
}

export const TxDetailsWrapper = ({
  txData,
  pubKey,
  height,
}: TxDetailsWrapperProps) => {
  const {
    state: { data: blockData },
  } = useFetch<TendermintBlocksResponse>(
    `${DATA_SOURCES.tendermintUrl}/block?height=${height}`,
    { cache: 'force-cache' }
  );

  const child = useMemo(() => getTransactionComponent(txData), [txData]);

  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const raw = get(blockData, `result.block.data.txs[${txData.index}]`);

  return (
    <>
      <section>{child({ txData, pubKey, blockData })}</section>

      <details title={t('Decoded transaction')} className="mt-3">
        <summary className="cursor-pointer">{t('Decoded transaction')}</summary>
        <TxContent data={txData} />
      </details>

      {raw ? (
        <details title={t('Raw transaction')} className="mt-3">
          <summary className="cursor-pointer">{t('Raw transaction')}</summary>
          <code className="break-all font-mono text-xs">{raw}</code>
        </details>
      ) : null}
    </>
  );
};

/**
 * Chooses the appropriate component to render the full details of a transaction
 *
 * @param txData
 * @returns JSX.Element
 */
function getTransactionComponent(txData?: BlockExplorerTransactionResult) {
  if (!txData) {
    return TxDetailsGeneric;
  }

  switch (txData.type) {
    case 'Submit Order':
      return TxDetailsOrder;
    case 'Cancel Order':
      return TxDetailsOrderCancel;
    case 'Amend Order':
      return TxDetailsOrderAmend;
    case 'Validator Heartbeat':
      return TxDetailsHeartbeat;
    case 'Amend LiquidityProvision Order':
      return TxDetailsLPAmend;
    case 'Batch Market Instructions':
      return TxDetailsBatch;
    case 'Chain Event':
      return TxDetailsChainEvent;
    case 'Node Vote':
      return TxDetailsNodeVote;
    case 'Withdraw':
      return TxDetailsWithdrawSubmission;
    case 'Delegate':
      return TxDetailsDelegate;
    case 'Undelegate':
      return TxDetailsUndelegate;
    default:
      return TxDetailsGeneric;
  }
}
