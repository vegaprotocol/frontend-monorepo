import { useT } from './use-t';
import { Dialog, Splash, SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { create } from 'zustand';
import { AssetDetailsTable } from './asset-details-table';
import { AssetProposalNotification } from '@vegaprotocol/proposals';
import { useAssetDataProvider } from './asset-data-provider';
import { Emblem } from '@vegaprotocol/emblem';

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
  // Used to fetch the correct asset icon for the current chain
  vegaChain: string;
}

export const AssetDetailsDialog = ({
  assetId,
  trigger,
  open,
  onChange,
  asJson = false,
  vegaChain,
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
    ? `${asset.name} | ${asset.symbol}`
    : t('Asset not found');

  return (
    <Dialog
      title={title}
      icon={
        <Emblem
          asset={assetId}
          chain={
            asset?.source.__typename === 'ERC20'
              ? asset.source.chainId
              : undefined
          }
        />
      }
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
          'There is 1 unit of the settlement asset ({{assetSymbol}}) to every 1 quote unit.',
          { assetSymbol }
        )}
      </p>
    </Dialog>
  );
};
