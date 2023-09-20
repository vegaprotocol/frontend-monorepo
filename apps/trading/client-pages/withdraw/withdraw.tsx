import { useSearchParams } from 'react-router-dom';
import { GetStarted } from '../../components/welcome-dialog';
import { WithdrawContainer } from '../../components/withdraw-container';

export const Withdraw = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  return (
    <>
      <WithdrawContainer assetId={assetId} />
      <GetStarted />
    </>
  );
};
