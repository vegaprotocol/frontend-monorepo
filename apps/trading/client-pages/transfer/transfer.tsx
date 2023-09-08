import { GetStarted } from '../../components/welcome-dialog';
import { t } from '@vegaprotocol/i18n';
import {
  TransferContainer,
  useTransferAssetIdStore,
} from '@vegaprotocol/accounts';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export const Transfer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  const selectedAssetId = useTransferAssetIdStore((store) => store.assetId);

  useEffect(() => {
    if (assetId && selectedAssetId && selectedAssetId !== assetId) {
      setSearchParams({});
    }
  }, [assetId, selectedAssetId, setSearchParams]);

  return (
    <div className="py-16 px-8 flex w-full justify-center">
      <div className="lg:min-w-[700px] min-w-[300px] max-w-[700px]">
        <h1 className="text-4xl xl:text-5xl uppercase font-alpha calt">
          {t('Transfer')}
        </h1>
        <div className="mt-10">
          <TransferContainer assetId={assetId} />
          <GetStarted />
        </div>
      </div>
    </div>
  );
};
