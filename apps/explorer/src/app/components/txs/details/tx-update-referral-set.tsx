import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';
import { ReferralTeam } from './referrals/team';

interface TxDetailsUpdateReferralProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * A copy of create referral set, effectively.
 * Updating a referral set without a team doesn't make sense,
 * but is valid, so this component ignores sense.
 */
export const TxDetailsUpdateReferralSet = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsUpdateReferralProps) => {
  if (!txData || !txData.command.updateReferralSet || !txData.signature) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const id = txSignatureToDeterministicId(txData.signature.value);

  const isTeam = txData.command.updateReferralSet.isTeam || false;

  return (
    <div>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        <TableRow modifier="bordered">
          <TableCell>{isTeam ? t('Team ID') : t('Referral code')}</TableCell>
          <TableCell>{id}</TableCell>
        </TableRow>
      </TableWithTbody>

      <ReferralTeam
        tx={txData.command.updateReferralSet}
        id={id}
        creator={txData.submitter}
      />
    </div>
  );
};
