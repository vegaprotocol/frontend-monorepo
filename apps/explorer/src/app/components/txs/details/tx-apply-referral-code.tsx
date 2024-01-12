import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { ReferralCodeOwner } from './referrals/referral-code-owner';

interface TxDetailsApplyReferralCodeProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * The signature can be turned in to an id with txSignatureToDeterministicId but
 */
export const TxDetailsApplyReferralCode = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsApplyReferralCodeProps) => {
  if (!txData || !txData.command.applyReferralCode || !txData.signature) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const referralCode = txData.command.applyReferralCode.id;

  return (
    <div>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Applied Code')}</TableCell>
          <TableCell>{referralCode}</TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>{t('Referrer')}</TableCell>
          <ReferralCodeOwner code={referralCode} />
        </TableRow>
      </TableWithTbody>
    </div>
  );
};
