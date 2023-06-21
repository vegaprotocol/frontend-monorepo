import { TruncatedLink } from '../truncate/truncated-link';
import { Routes } from '../../routes/route-names';
import { TxOrderType } from './tx-order-type';
import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import { toHex } from '../search/detect-search';
import { ChainResponseCode } from './details/chain-response-code/chain-reponse.code';
import isNumber from 'lodash/isNumber';
import { PartyLink } from '../links';

const TRUNCATE_LENGTH = 7;

export const TxsInfiniteListItem = ({
  hash,
  code,
  submitter,
  type,
  block,
  command,
}: Partial<BlockExplorerTransactionResult>) => {
  if (
    !hash ||
    !submitter ||
    !type ||
    code === undefined ||
    block === undefined ||
    command === undefined
  ) {
    return <div>Missing vital data</div>;
  }

  return (
    <tr
      data-testid="transaction-row"
      className="text-left items-center h-full border-t border-neutral-600 dark:border-neutral-800 txs-infinite-list-item py-[2px]"
    >
      <td
        className="text-sm leading-none whitepsace-nowrap font-mono"
        data-testid="tx-hash"
      >
        {isNumber(code) ? (
          <ChainResponseCode code={code} hideLabel={true} hideIfOk={true} />
        ) : (
          code
        )}
        <TruncatedLink
          to={`/${Routes.TX}/${toHex(hash)}`}
          text={hash}
          startChars={TRUNCATE_LENGTH}
          endChars={0}
        />
      </td>
      <td className="text-sm leading-none">
        <TxOrderType orderType={type} command={command} />
      </td>
      <td className="text-sm leading-none" data-testid="pub-key">
        <PartyLink truncate={true} id={submitter} />
      </td>
      <td className="text-sm items-center font-mono" data-testid="tx-block">
        <TruncatedLink
          to={`/${Routes.BLOCKS}/${block}`}
          text={block}
          startChars={TRUNCATE_LENGTH}
          endChars={TRUNCATE_LENGTH}
        />
      </td>
    </tr>
  );
};
