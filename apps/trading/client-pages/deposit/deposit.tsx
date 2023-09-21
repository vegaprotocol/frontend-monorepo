import { DepositContainer } from '@vegaprotocol/deposits';
import { useSearchParams } from 'react-router-dom';
import { DepositGetStarted } from './deposit-get-started';

export const Deposit = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  return (
    <div className="flex flex-col gap-6">
      <DepositContainer assetId={assetId} />
      <DepositGetStarted />
    </div>
  );
};
