import { t } from '@vegaprotocol/react-helpers';
import { useAssetsDataProvider } from './assets-data-provider';
import { Button, Dialog, Icon, Splash } from '@vegaprotocol/ui-toolkit';
import create from 'zustand';
import { AssetDetailsTable } from './asset-details-table';

export type AssetDetailsDialogStore = {
  isOpen: boolean;
  id: string;
  trigger: HTMLElement | null | undefined;
  setOpen: (isOpen: boolean) => void;
  open: (id: string, trigger?: HTMLElement | null) => void;
};

export const useAssetDetailsDialogStore = create<AssetDetailsDialogStore>(
  (set) => ({
    isOpen: false,
    id: '',
    trigger: null,
    setOpen: (isOpen) => {
      set({ isOpen: isOpen });
    },
    open: (id, trigger?) => {
      set({
        isOpen: true,
        id,
        trigger,
      });
    },
  })
);

export interface AssetDetailsDialogProps {
  assetId: string;
  trigger?: HTMLElement | null;
  open: boolean;
  onChange: (open: boolean) => void;
}

export const AssetDetailsDialog = ({
  assetId,
  trigger,
  open,
  onChange,
}: AssetDetailsDialogProps) => {
  const { data } = useAssetsDataProvider();

  const asset = data?.find((a) => a.id === assetId);

  const content = asset ? (
    <div className="my-2">
      <AssetDetailsTable asset={asset} />
    </div>
  ) : (
    <div className="py-12" data-testid="splash">
      <Splash>{t('No data')}</Splash>
    </div>
  );
  const title = asset
    ? t(`Asset details - ${asset.symbol}`)
    : t('Asset not found');

  return (
    <Dialog
      title={title}
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
