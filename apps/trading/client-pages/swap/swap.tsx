import { useSearchParams } from 'react-router-dom';
import { SwapContainer } from '../../components/swap';

export const Swap = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  return <SwapContainer assetId={assetId} />;
};
