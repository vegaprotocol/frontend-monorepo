import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';
import { ReferralTeam } from './referrals/team';

interface TxDetailsCreateReferralProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * The signature can be turned in to an id with txSignatureToDeterministicId but
 */
export const TxDetailsCreateReferralSet = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsCreateReferralProps) => {
  if (!txData || !txData.command.createReferralSet || !txData.signature) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const id = txSignatureToDeterministicId(txData.signature.value);

  return (
    <div>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Set ID')}</TableCell>
          <TableCell>{id}</TableCell>
        </TableRow>
      </TableWithTbody>

      <ReferralTeam
        tx={txData.command.createReferralSet}
        id={id}
        creator={txData.submitter}
      />
    </div>
  );
};
