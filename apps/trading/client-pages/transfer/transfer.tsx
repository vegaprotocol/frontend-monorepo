import { useSearchParams } from 'react-router-dom';
import { t } from '@vegaprotocol/i18n';
import { TransferContainer } from '@vegaprotocol/accounts';
import { GetStarted } from '../../components/welcome-dialog';
import { PageTitle } from '../../components/page-title';

export const Transfer = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;

  return (
    <>
      <PageTitle>{t('Transfer')}</PageTitle>
      <div className="mt-10">
        <TransferContainer assetId={assetId} />
        <GetStarted />
      </div>
    </>
  );
};
