import { useSearchParams } from 'react-router-dom';
import { TransferContainer } from '@vegaprotocol/accounts';
import { GetStarted } from '../../components/welcome-dialog/get-started';

export const Transfer = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;

  return (
    <>
      <TransferContainer assetId={assetId} />
      <GetStarted />
    </>
  );
};
