import { useT } from './use-t';
import {
  Button,
  Dialog,
  Splash,
  SyntaxHighlighter,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { create } from 'zustand';
import { AssetDetailsTable } from './asset-details-table';
import { AssetProposalNotification } from '@vegaprotocol/proposals';
import { useAssetDataProvider } from './asset-data-provider';

export type AssetDetailsDialogStore = {
  isOpen: boolean;
  id: string;
  trigger: HTMLElement | null | undefined;
  asJson: boolean;
  setOpen: (isOpen: boolean) => void;
  open: (id: string, trigger?: HTMLElement | null, asJson?: boolean) => void;
};

export const useAssetDetailsDialogStore = create<AssetDetailsDialogStore>()(
  (set) => ({
    isOpen: false,
    id: '',
    trigger: null,
    asJson: false,
    setOpen: (isOpen) => {
      set({ isOpen: isOpen });
    },
    open: (id, trigger?, asJson = false) => {
      set({
        isOpen: true,
        id,
        trigger,
        asJson,
      });
    },
  })
);

export interface AssetDetailsDialogProps {
  assetId: string;
  trigger?: HTMLElement | null;
  open: boolean;
  onChange: (open: boolean) => void;
  asJson?: boolean;
}

export const AssetDetailsDialog = ({
  assetId,
  trigger,
  open,
  onChange,
  asJson = false,
}: AssetDetailsDialogProps) => {
  const t = useT();
  const { data: asset } = useAssetDataProvider(assetId);

  const assetSymbol = asset?.symbol || '';

  const content = asset ? (
    <div className="my-2">
      <AssetProposalNotification assetId={asset.id} />
      {asJson ? (
        <div className="pr-8">
          <SyntaxHighlighter size="smaller" data={asset} />
        </div>
      ) : (
        <AssetDetailsTable asset={asset} />
      )}
    </div>
  ) : (
    <div className="py-12" data-testid="splash">
      <Splash>{t('No data')}</Splash>
    </div>
  );
  const title = asset
    ? t('Asset details - {{symbol}}', asset)
    : t('Asset not found');

  return (
    <Dialog
      title={title}
      icon={<VegaIcon name={VegaIconNames.INFO} />}
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
      <p className="my-4 text-xs">
        {t(
          'There is 1 unit of the settlement asset (%s) to every 1 quote unit.',
          [assetSymbol]
        )}
      </p>
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
