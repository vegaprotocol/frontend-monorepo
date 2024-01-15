import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { ReferralCodeOwner } from './referrals/referral-code-owner';

interface TxDetailsJoinTeamProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * The signature can be turned in to an id with txSignatureToDeterministicId but
 */
export const TxDetailsJoinTeam = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsJoinTeamProps) => {
  if (!txData || !txData.command.joinTeam || !txData.signature) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const team = txData.command.joinTeam.id;

  return (
    <div>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Team')}</TableCell>
          <TableCell>{team}</TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>{t('Referrer')}</TableCell>
          <ReferralCodeOwner code={team} />
        </TableRow>
      </TableWithTbody>
    </div>
  );
};
