import { useSearchParams } from 'react-router-dom';
import { useWithdrawStore } from '@vegaprotocol/withdraws';
import { GetStarted } from '../../components/welcome-dialog';
import { t } from '@vegaprotocol/i18n';
import { WithdrawContainer } from '../../components/withdraw-container';
import { useEffect } from 'react';

export const Withdraw = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  const asset = useWithdrawStore((store) => store.asset);
  useEffect(() => {
    if (assetId && asset?.id && assetId !== asset.id) {
      setSearchParams({});
    }
  }, [assetId, asset, setSearchParams]);
  return (
    <div className="py-16 px-8 flex w-full justify-center">
      <div className="lg:min-w-[700px] min-w-[300px] max-w-[700px]">
        <h1 className="text-4xl xl:text-5xl uppercase font-alpha calt">
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
