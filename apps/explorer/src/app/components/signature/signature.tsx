import { useState } from 'react';
import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import {
  CopyWithTooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

interface SignatureProps {
  signature: BlockExplorerTransactionResult['signature'];
}

const valueClass =
  'font-mono px-2.5 py-0.5 text-xs max-w-[200px] cursor-pointer';
const valueClassClosed = 'text-ellipsis overflow-hidden';
const valueClassOpen = 'break-words text-left';

/**
 * Viewer component for a vega signature. Featuers copy and pasting, truncation
 *
 * @param signature
 */
export const Signature = ({ signature }: SignatureProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!signature || !signature.value || !signature.version || !signature.algo) {
    return null;
  }

  return (
    <div className="inline-flex border rounded signature-component relative pr-[20px]">
      <div
        className="bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 select-none cursor-default"
        title={`${signature.algo}`}
      >
        <span>v{signature.version}</span>
      </div>
      <div
        className={
          isOpen
            ? `${valueClass} ${valueClassOpen}`
            : `${valueClass} ${valueClassClosed}`
        }
      >
        <CopyWithTooltip text={signature.value}>
          <span title={signature.value}>{signature.value}</span>
        </CopyWithTooltip>
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-[-3px] right-0 pr-2"
        title={t('Show full signature')}
      >
        <VegaIcon name={isOpen ? VegaIconNames.EYE_OFF : VegaIconNames.EYE} />
      </button>
    </div>
  );
};
