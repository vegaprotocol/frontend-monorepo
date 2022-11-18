import React from 'react';
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
    `${DATA_SOURCES.tendermintUrl}/block?height=${height}`
  );

  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  let child;

  if (txData.type === 'Submit Order') {
    child = (
      <TxDetailsOrder txData={txData} blockData={blockData} pubKey={pubKey} />
    );
  } else if (txData.type === 'Validator Heartbeat') {
    child = (
      <TxDetailsHeartbeat
        txData={txData}
        blockData={blockData}
        pubKey={pubKey}
      />
    );
  } else if (txData.type === 'Amend LiquidityProvision Order') {
    child = (
      <TxDetailsLPAmend txData={txData} blockData={blockData} pubKey={pubKey} />
    );
  } else if (txData.type === 'Batch Market Instructions') {
    child = (
      <TxDetailsBatch txData={txData} blockData={blockData} pubKey={pubKey} />
    );
  } else if (txData.type === 'Chain Event') {
    child = (
      <TxDetailsChainEvent
        txData={txData}
        blockData={blockData}
        pubKey={pubKey}
      />
    );
  } else {
    child = (
      <TxDetailsGeneric txData={txData} blockData={blockData} pubKey={pubKey} />
    );
  }

  if (!child) {
    return null;
  }

  return (
    <>
      <section>{child}</section>

      <details title={t('Decoded transaction')} className="mt-3">
        <summary className="cursor-pointer">{t('Decoded transaction')}</summary>
        <TxContent data={txData} />
      </details>

      <details title={t('Raw transaction')} className="mt-3">
        <summary className="cursor-pointer">{t('Raw transaction')}</summary>
        <code className="break-all font-mono text-xs">
          {blockData?.result.block.data.txs[txData.index]}
        </code>
      </details>
    </>
  );
};
