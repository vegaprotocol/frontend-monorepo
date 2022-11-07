import { t } from '@vegaprotocol/react-helpers';
import { StatusMessage } from '../../../components/status-message';
import { NestedDataList } from '../../../components/nested-data-list';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';

interface TxContentProps {
  data: BlockExplorerTransactionResult | undefined;
}

export const TxContent = ({ data }: TxContentProps) => {
  if (!data?.command) {
    return (
      <StatusMessage>
        {t('Could not retrieve transaction content')}
      </StatusMessage>
    );
  }

  return <NestedDataList data={data.command} />;
};
