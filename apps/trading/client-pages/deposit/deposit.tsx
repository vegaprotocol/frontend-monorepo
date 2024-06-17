import { useSearchParams } from 'react-router-dom';
import { DepositContainer } from '../../components/deposit-container';

export const Deposit = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || '';

  return <DepositContainer initialAssetId={assetId} />;
};
