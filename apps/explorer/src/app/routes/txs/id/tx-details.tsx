import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { TxDetailsWrapper } from '../../../components/txs/details/tx-details-wrapper';

interface TxDetailsProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  className?: string;
}

export const txDetailsTruncateLength = 30;

export const TxDetails = ({ txData, pubKey, className }: TxDetailsProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }
  return (
    <section className="mb-10" key={txData.hash}>
      <TxDetailsWrapper height={txData.block} txData={txData} pubKey={pubKey} />
    </section>
  );
};
