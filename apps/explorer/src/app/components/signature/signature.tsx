import { useState } from 'react';
import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

interface SignatureProps {
  signature: BlockExplorerTransactionResult['signature'];
}

const valueClass = 'font-mono px-2.5 py-0.5 text-xs max-w-[200px]';
const valueClassClosed = 'text-ellipsis overflow-hidden';
const valueClassOpen = 'break-words text-left';

export const Signature = ({ signature }: SignatureProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!signature || !signature.value || !signature.version || !signature.algo) {
    return null;
  }

  return (
    <div className="inline-flex border rounded signature-component relative pr-[20px]">
      <span
        className="bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 select-none cursor-default"
        title={`Version ${signature.version}`}
      >
        {signature.algo}
      </span>
      <div
        className={
          isOpen
            ? `${valueClass} ${valueClassOpen}`
            : `${valueClass} ${valueClassClosed}`
        }
      >
        <span>{signature.value}</span>
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-[-3px] right-0 pr-2"
      >
        <VegaIcon name={VegaIconNames.EYE} />
      </button>
    </div>
  );
};
