import { useSearchParams } from 'react-router-dom';
import { GetStarted } from '../../components/welcome-dialog';
import { t } from '@vegaprotocol/i18n';
import { WithdrawContainer } from '../../components/withdraw-container';

export const Withdraw = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  return (
    <div className="flex justify-center w-full px-8 py-16">
      <div className="lg:min-w-[700px] min-w-[300px] max-w-[700px]">
        <h1 className="text-4xl uppercase xl:text-5xl font-alpha calt">
          {t('Withdraw')}
        </h1>
        <div className="mt-10">
          <WithdrawContainer assetId={assetId} />
          <GetStarted />
        </div>
      </div>
    </div>
  );
};
