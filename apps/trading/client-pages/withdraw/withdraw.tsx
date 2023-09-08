import { useSearchParams } from 'react-router-dom';
import { t } from '@vegaprotocol/i18n';
import { GetStarted } from '../../components/welcome-dialog';
import { WithdrawContainer } from '../../components/withdraw-container';
import { PageTitle } from '../../components/page-title';

export const Withdraw = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  return (
    <>
      <PageTitle>{t('Withdraw')}</PageTitle>
      <div className="mt-10">
        <WithdrawContainer assetId={assetId} />
        <GetStarted />
      </div>
    </>
  );
};
