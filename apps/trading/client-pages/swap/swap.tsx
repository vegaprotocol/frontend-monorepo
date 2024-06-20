import { useNavigate, useSearchParams } from 'react-router-dom';
import { SwapContainer } from '../../components/swap';
import { Links } from '../../lib/links';

export const Swap = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  const navigate = useNavigate();
  const onDeposit = () => navigate(Links.DEPOSIT());
  return (
    <div className="flex flex-col gap-6">
      <SwapContainer assetId={assetId} onDeposit={onDeposit} />;
    </div>
  );
};
