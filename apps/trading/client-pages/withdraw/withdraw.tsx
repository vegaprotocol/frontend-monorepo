import { useSearchParams } from 'react-router-dom';
import { WithdrawContainer } from '../../components/withdraw-container';

export const Withdraw = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;

  return <WithdrawContainer initialAssetId={assetId} />;
};
