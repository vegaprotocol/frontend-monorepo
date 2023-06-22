import { TruncatedLink } from '../truncate/truncated-link';
import { Routes } from '../../routes/route-names';
import { TxOrderType } from './tx-order-type';
import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import { toHex } from '../search/detect-search';
import { ChainResponseCode } from './details/chain-response-code/chain-reponse.code';
import isNumber from 'lodash/isNumber';
import { PartyLink } from '../links';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import type { Screen } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';

const DEFAULT_TRUNCATE_LENGTH = 7;

export function getIdTruncateLength(screen: Screen): number {
  if (['xxxl', 'xxl', 'xl', 'lg'].includes(screen)) {
    return 64;
  } else if (['md'].includes(screen)) {
    return 32;
  }
  return DEFAULT_TRUNCATE_LENGTH;
}

export function shouldTruncateParty(screen: Screen): boolean {
  return !['xxxl', 'xxl', 'xl'].includes(screen);
}

export const TxsInfiniteListItem = ({
  hash,
  code,
  submitter,
  type,
  block,
  command,
}: Partial<BlockExplorerTransactionResult>) => {
  const { screenSize } = useScreenDimensions();
  const idTruncateLength = useMemo(
    () => getIdTruncateLength(screenSize),
    [screenSize]
  );

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
        className="text-sm leading-none whitespace-nowrap font-mono"
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
          startChars={idTruncateLength}
          endChars={0}
        />
      </td>
      <td className="text-sm leading-none">
        <TxOrderType orderType={type} command={command} />
      </td>
      <td className="text-sm leading-none" data-testid="pub-key">
        <PartyLink truncate={shouldTruncateParty(screenSize)} id={submitter} />
      </td>
      <td className="text-sm items-center font-mono" data-testid="tx-block">
        <TruncatedLink
          to={`/${Routes.BLOCKS}/${block}`}
          text={block}
          startChars={5}
          endChars={5}
        />
      </td>
    </tr>
  );
};
