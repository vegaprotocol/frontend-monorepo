import { Link } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { Links } from '../../config';

export const DownloadWalletPrompt = () => {
  const { t } = useTranslation();
  return (
    <div className="mt-8">
      <h3>{t('getWallet')}</h3>
      <p>
        <Link className="text-deemphasise" href={Links.WALLET_GUIDE}>
          {t('readGuide')}
        </Link>
      </p>
      <p>
        <Link className="text-deemphasise" href={Links.WALLET_RELEASES}>
          {t('downloadWallet')}
        </Link>
      </p>
    </div>
  );
};
