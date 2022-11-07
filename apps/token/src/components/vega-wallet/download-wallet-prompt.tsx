import { Link } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { ExternalLinks as Links } from '@vegaprotocol/react-helpers';

export const DownloadWalletPrompt = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className="mt-4 mb-2">{t('getWallet')}</h3>
      <p>
        <Link className="text-neutral-500" href={Links.VEGA_WALLET_URL}>
          {t('getWalletLink')}
        </Link>
      </p>
    </>
  );
};
