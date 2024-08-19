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
import { TimeAgo } from '../time-ago';

const DEFAULT_TRUNCATE_LENGTH = 7;

export function getIdTruncateLength(screen: Screen): number {
  if (['xxxl', 'xxl'].includes(screen)) {
    return 32;
  } else if (['xl', 'lg', 'md'].includes(screen)) {
    return 16;
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
  createdAt,
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
      className="transaction-row text-left items-center h-full border-t border-gs-300 dark:border-gs-700 txs-infinite-list-item py-[2px]"
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
      {['lg', 'xl', 'xxl', 'xxxl'].includes(screenSize) && (
        <td className="text-sm items-center font-mono" data-testid="tx-time">
          {createdAt ? <TimeAgo date={createdAt} /> : '-'}
        </td>
      )}
    </tr>
  );
};
