import { t } from '@vegaprotocol/react-helpers';
import type { ButtonVariant } from '@vegaprotocol/ui-toolkit';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { Intent } from '@vegaprotocol/ui-toolkit';
import { Button, Notification } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';

interface Props {
  disabled: boolean;
  variant: ButtonVariant;
  assetSymbol: string;
}

export const DealTicketButton = ({ disabled, variant, assetSymbol }: Props) => {
  const { pubKey } = useVegaWallet();
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  return pubKey ? (
    <div className="mb-4">
      <Button
        variant={variant}
        fill
        type="submit"
        disabled={disabled}
        data-testid="place-order"
      >
        {t('Place order')}
      </Button>
    </div>
  ) : (
    <>
      <Notification
        intent={Intent.Danger}
        message={
          <p className="text-sm pb-2">
            You need a{' '}
            <ExternalLink href="https://vega.xyz/wallet">
              Vega wallet
            </ExternalLink>{' '}
            with {assetSymbol} to start trading in this market.
          </p>
        }
      />
      <div>
        <Button
          variant="default"
          fill
          type="button"
          data-testid="order-connect-wallet"
          onClick={openVegaWalletDialog}
          className="my-2"
        >
          {t('Connect wallet')}
        </Button>
        <Button
          variant={variant}
          fill
          type="submit"
          disabled={true}
          data-testid="place-order"
        >
          {t('Place order')}
        </Button>
      </div>
    </>
  );
};
