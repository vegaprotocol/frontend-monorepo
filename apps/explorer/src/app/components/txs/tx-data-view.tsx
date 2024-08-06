import { useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import get from 'lodash/get';
import { Select } from '@vegaprotocol/ui-toolkit';

import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../routes/blocks/tendermint-blocks-response';

export function getClassName(showTxData: ShowTxDataType) {
  const baseClasses =
    'font-mono bg-gs-300 text-[11px] leading-3 text-gray-900 w-full p-2 max-w-[615px]';
  if (showTxData === 'JSON') {
    return `${baseClasses} whitespace-pre overflow-x-scroll`;
  } else {
    return baseClasses;
  }
}

export function getContents(
  showTxData: ShowTxDataType,
  txData: BlockExplorerTransactionResult | null,
  blockData: TendermintBlocksResponse | null | undefined
) {
  if (showTxData === 'JSON') {
    if (txData) {
      return JSON.stringify(txData.command, undefined, 1);
    }
  } else {
    if (txData && blockData) {
      return get(blockData, `result.block.data.txs[${txData.index}]`);
    }
  }

  return '-';
}

type ShowTxDataType = 'JSON' | 'base64';

interface TxDataViewProps {
  txData: BlockExplorerTransactionResult | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

export const TxDataView = ({ txData, blockData }: TxDataViewProps) => {
  const [showTxData, setShowTxData] = useState<ShowTxDataType>('JSON');

  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <details title={t('Show raw transaction')}>
      <summary className="cursor-pointer">{t('Show raw transaction')}</summary>
      <div className="py-4">
        <textarea
          readOnly={true}
          className={getClassName(showTxData)}
          rows={12}
          cols={120}
          value={getContents(showTxData, txData, blockData)}
        />
        <div className="w-40">
          <Select
            placeholder="View as..."
            onChange={(v) => setShowTxData(v.target.value as ShowTxDataType)}
            value={showTxData}
          >
            <option value={'JSON'}>JSON</option>
            <option value={'base64'}>Base64</option>
          </Select>
        </div>
      </div>
    </details>
  );
};
