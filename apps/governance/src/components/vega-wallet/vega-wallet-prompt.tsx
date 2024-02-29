import { ButtonLink, Link } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { ExternalLinks } from '@vegaprotocol/environment';
// import { useViewAsDialog } from '@vegaprotocol/wallet';

export const VegaWalletPrompt = () => {
  const { t } = useTranslation();
  // const setViewAsDialog = useViewAsDialog((state) => state.setOpen);
  return (
    <>
      <h3 className="mt-4 mb-2">{t('getWallet')}</h3>
      <div className="flex flex-row gap-4">
        <Link className="text-neutral-500" href={ExternalLinks.VEGA_WALLET_URL}>
          {t('getWalletLink')}
        </Link>
        <ButtonLink
          className="text-neutral-500"
          data-testid="view-as-user"
          // TODO: fix me
          // onClick={() => setViewAsDialog(true)}
        >
          {t('viewAsParty')}
        </ButtonLink>
      </div>
    </>
  );
};
