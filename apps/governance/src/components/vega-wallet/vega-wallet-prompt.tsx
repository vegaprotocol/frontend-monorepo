import { Link } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { ExternalLinks } from '@vegaprotocol/environment';

export const VegaWalletPrompt = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className="mt-4 mb-2">{t('getWallet')}</h3>
      <Link className="text-neutral-500" href={ExternalLinks.VEGA_WALLET_URL}>
        {t('getWalletLink')}
      </Link>
    </>
  );
};
