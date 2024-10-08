import { useSearchParams } from 'react-router-dom';
import { DepositContainer } from '../../components/deposit-container';

export const Deposit = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || '';

  return (
    <div className="flex flex-col gap-6">
      <DepositContainer initialAssetId={assetId} />
    </div>
  );
};
