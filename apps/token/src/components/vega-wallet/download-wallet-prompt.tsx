import { Link } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { Links } from '../../config';

export const DownloadWalletPrompt = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className="mt-12 mb-4">{t('getWallet')}</h3>
      <p className="mb-4">
        <Link className="text-deemphasise" href={Links.WALLET_GUIDE}>
          {t('readGuide')}
        </Link>
      </p>
      <p className="mb-4">
        <Link className="text-deemphasise" href={Links.WALLET_RELEASES}>
          {t('downloadWallet')}
        </Link>
      </p>
    </>
  );
};
