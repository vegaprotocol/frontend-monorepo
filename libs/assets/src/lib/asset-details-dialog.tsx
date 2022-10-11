import { t } from '@vegaprotocol/react-helpers';
import { useAssetsDataProvider } from './assets-data-provider';
import { Button, Dialog, Icon, Splash } from '@vegaprotocol/ui-toolkit';
import create from 'zustand';
import { AssetDetailsTable } from './asset-details-table';
import type { Asset } from './asset-data-provider';

export type AssetDetailsDialogStore = {
  isOpen: boolean;
  symbol: string | Asset;
  trigger: HTMLElement | null | undefined;
  setOpen: (isOpen: boolean) => void;
  open: (symbol: string | Asset, trigger?: HTMLElement | null) => void;
};

export const useAssetDetailsDialogStore = create<AssetDetailsDialogStore>(
  (set) => ({
    isOpen: false,
    symbol: '',
    trigger: null,
    setOpen: (isOpen) => {
      set({ isOpen: isOpen });
    },
    open: (symbol, trigger?) => {
      set({
        isOpen: true,
        symbol: symbol,
        trigger: trigger,
      });
    },
  })
);

export interface AssetDetailsDialogProps {
  assetSymbol: string | Asset;
  trigger?: HTMLElement | null;
  open: boolean;
  onChange: (open: boolean) => void;
}
export const AssetDetailsDialog = ({
  assetSymbol,
  trigger,
  open,
  onChange,
}: AssetDetailsDialogProps) => {
  const { data } = useAssetsDataProvider();

  const symbol =
    typeof assetSymbol === 'string' ? assetSymbol : assetSymbol.symbol;
  const asset = data?.find((a) => a?.symbol === symbol);

  const content = asset ? (
    <div className="my-2">
      <AssetDetailsTable asset={asset} />
    </div>
  ) : (
    <div className="py-12" data-testid="splash">
      <Splash>{t('No data')}</Splash>
    </div>
  );

  return (
    <Dialog
      title={t(`Asset details - ${symbol}`)}
      icon={<Icon name="info-sign"></Icon>}
      open={open}
      onChange={(isOpen) => onChange(isOpen)}
      onCloseAutoFocus={(e) => {
        /**
         * This mimics radix's default behaviour that focuses the dialog's
         * trigger after closing itself
         */
        if (trigger) {
          e.preventDefault();
          trigger.focus();
        }
      }}
    >
      {content}
      <div className="w-1/4">
        <Button
          data-testid="close-asset-details-dialog"
          fill={true}
          size="sm"
          onClick={() => onChange(false)}
        >
          {t('Close')}
        </Button>
      </div>
    </Dialog>
  );
};
