import { ButtonLink, Link } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { ExternalLinks } from '@vegaprotocol/environment';
import { useConnect } from '@vegaprotocol/wallet-react';

export const VegaWalletPrompt = () => {
  const { t } = useTranslation();
  const { connect } = useConnect();
  return (
    <>
      <h3 className="mt-4 mb-2">{t('getWallet')}</h3>
      <div className="flex flex-row gap-4">
        <Link
          href={ExternalLinks.VEGA_WALLET_URL}
          className="text-surface-0-fg-muted"
        >
          {t('getWalletLink')}
        </Link>
        <ButtonLink
          data-testid="view-as-user"
          onClick={() => connect('viewParty')}
          className="text-surface-0-fg-muted"
        >
          {t('viewAsParty')}
        </ButtonLink>
      </div>
    </>
  );
};
