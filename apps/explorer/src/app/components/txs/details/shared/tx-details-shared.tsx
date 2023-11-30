import { t } from '@vegaprotocol/i18n';
import { TableRow, TableCell } from '../../../table';
import { BlockLink, PartyLink } from '../../../links/';
import { TimeAgo } from '../../../time-ago';

import type { BlockExplorerTransactionResult } from '../../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../../routes/blocks/tendermint-blocks-response';
import { Time } from '../../../time';
import { ChainResponseCode } from '../chain-response-code/chain-reponse.code';
import { TxDataView } from '../../tx-data-view';
import Hash from '../../../links/hash';
import { Signature } from '../../../signature/signature';

interface TxDetailsSharedProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;

  // A transitional property used in some complex TX types to display more detailed type information
  // than the shared component can derive
  hideTypeRow?: boolean;
}

// Applied to all header cells
export const sharedHeaderProps = {
  // Ensures that multi line contents still have the header aligned to the first line
  className: 'align-top',
};

const Labels: Record<BlockExplorerTransactionResult['type'], string> = {
  'Stop Orders Submission': 'Stop Order',
  'Stop Orders Cancellation': 'Cancel Stop Order',
};

/**
 * These rows are shown for every transaction type, providing a consistent set of rows for the top
 * of a transaction details row. The order is relatively arbitrary but felt right - it might need to
 * change as the views get more bespoke.
 */
export const TxDetailsShared = ({
  txData,
  pubKey,
  blockData,
  hideTypeRow = false,
}: TxDetailsSharedProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const time: string = blockData?.result.block.header.time || '';
  const height: string = blockData?.result.block.header.height || txData.block;

  const type = Labels[txData.type] || txData.type;

  return (
    <>
      {hideTypeRow === false ? (
        <TableRow modifier="bordered">
          <TableCell {...sharedHeaderProps}>{t('Type')}</TableCell>
          <TableCell>{type}</TableCell>
        </TableRow>
      ) : null}
      <TableRow modifier="bordered">
        <TableCell {...sharedHeaderProps}>{t('Hash')}</TableCell>
        <TableCell>
          <Hash text={txData.hash.toLowerCase()} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell {...sharedHeaderProps}>{t('Submitter')}</TableCell>
        <TableCell>{pubKey ? <PartyLink id={pubKey} /> : '-'}</TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell {...sharedHeaderProps}>{t('Block')}</TableCell>
        <TableCell>
          <BlockLink height={height} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell {...sharedHeaderProps}>{t('Signature')}</TableCell>
        <TableCell>
          <Signature signature={txData.signature} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell {...sharedHeaderProps}>{t('Time')}</TableCell>
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
        <TableCell {...sharedHeaderProps}>{t('Response code')}</TableCell>
        <TableCell>
          <ChainResponseCode code={txData.code} error={txData.error} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell {...sharedHeaderProps}>{t('Transaction')}</TableCell>
        <TableCell>
          <TxDataView blockData={blockData} txData={txData} />
        </TableCell>
      </TableRow>
    </>
  );
};
