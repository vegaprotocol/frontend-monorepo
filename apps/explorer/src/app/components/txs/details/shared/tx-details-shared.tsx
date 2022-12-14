import { t } from '@vegaprotocol/react-helpers';
import { TableRow, TableCell } from '../../../table';
import { BlockLink, PartyLink } from '../../../links/';
import { TimeAgo } from '../../../time-ago';

import type { BlockExplorerTransactionResult } from '../../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../../routes/blocks/tendermint-blocks-response';
import { Time } from '../../../time';
import { ChainResponseCode } from '../chain-response-code/chain-reponse.code';

interface TxDetailsSharedProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * These rows are shown for every transaction type, providing a consistent set of rows for the top
 * of a transaction details row. The order is relatively arbitrary but felt right - it might need to
 * change as the views get more bespoke.
 */
export const TxDetailsShared = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsSharedProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const time: string = blockData?.result.block.header.time || '';
  const height: string = blockData?.result.block.header.height || txData.block;

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Type')}</TableCell>
        <TableCell>{txData.type}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Hash')}</TableCell>
        <TableCell>
          <code>{txData.hash}</code>
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Submitter')}</TableCell>
        <TableCell>{pubKey ? <PartyLink id={pubKey} /> : '-'}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Block')}</TableCell>
        <TableCell>
          <BlockLink height={height} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Time')}</TableCell>
        <TableCell>
          {time ? (
            <div>
              <span className="mr-5">
                <Time date={time} />
              </span>
              <span>
                <TimeAgo date={time} />
              </span>
            </div>
          ) : (
            '-'
          )}
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Response code')}</TableCell>
        <TableCell>
          <ChainResponseCode code={txData.code} error={txData.error} />
        </TableCell>
      </TableRow>
    </>
  );
};
