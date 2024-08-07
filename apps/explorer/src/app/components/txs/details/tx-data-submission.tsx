import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import { OpenOracleData } from './oracle-data/data-submission-open-oracle';
import { JSONOracleData } from './oracle-data/data-submission-json-oracle';

export type OracleSubmissionSource =
  components['schemas']['OracleDataSubmissionOracleSource'];

interface TxDetailsDataSubmissionProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Oracle Data arriving
 */
export const TxDetailsDataSubmission = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsDataSubmissionProps) => {
  if (!txData || !txData.command.oracleDataSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const type: OracleSubmissionSource =
    txData.command.oracleDataSubmission.source;
  if (!type) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const payload = txData.command.oracleDataSubmission.payload;

  return (
    <>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
      </TableWithTbody>
      {type === 'ORACLE_SOURCE_OPEN_ORACLE' ? (
        <OpenOracleData payload={payload} />
      ) : (
        <JSONOracleData payload={payload} />
      )}
    </>
  );
};
