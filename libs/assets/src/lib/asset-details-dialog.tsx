import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import type { Asset } from '@vegaprotocol/react-helpers';
import {
  Button,
  Dialog,
  Icon,
  KeyValueTable,
  KeyValueTableRow,
  Splash,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { useAssetsConnectionQuery } from './__generated__/Assets';
import type { Schema } from '@vegaprotocol/types';
import create from 'zustand';

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

type AssetDetails = {
  key: string;
  label: string;
  value: string;
  tooltip: string;
}[];

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
  const { data } = useAssetsConnectionQuery();
  const symbol =
    typeof assetSymbol === 'string' ? assetSymbol : assetSymbol.symbol;
  const asset = data?.assetsConnection?.edges?.find(
    (e) => e?.node.symbol === symbol
  );

  let details: AssetDetails = [];
  if (asset != null) {
    details = [
      {
        key: 'name',
        label: t('Name'),
        value: asset.node.name,
        tooltip: '', // t('Name of the asset (e.g: Great British Pound)')
      },
      {
        key: 'symbol',
        label: t('Symbol'),
        value: asset.node.symbol,
        tooltip: '', // t('Symbol of the asset (e.g: GBP)')
      },
      {
        key: 'decimals',
        label: t('Decimals'),
        value: asset.node.decimals.toString(),
        tooltip: t('Number of decimal / precision handled by this asset'),
      },
      {
        key: 'quantum',
        label: t('Quantum'),
        value: asset.node.quantum,
        tooltip: t('The minimum economically meaningful amount in the asset'),
      },
      {
        key: 'contractaddress',
        label: t('Contract address'),
        value: (asset.node.source as Schema.ERC20).contractAddress,
        tooltip: t(
          'The address of the contract for the token, on the ethereum network'
        ),
      },
      {
        key: 'withdrawalthreshold',
        label: t('Withdrawal threshold'),
        value: addDecimalsFormatNumber(
          (asset.node.source as Schema.ERC20).withdrawThreshold,
          asset.node.decimals
        ),
        tooltip: t(
          'The maximum allowed per withdraw note: this is a temporary measure for restricted mainnet'
        ),
      },
      {
        key: 'lifetimelimit',
        label: t('Lifetime limit'),
        value: addDecimalsFormatNumber(
          (asset.node.source as Schema.ERC20).lifetimeLimit,
          asset.node.decimals
        ),
        tooltip: t(
          'The lifetime limits deposit per address note: this is a temporary measure for restricted mainnet'
        ),
      },
    ];
  }

  const content = asset ? (
    <div className="my-2">
      <KeyValueTable>
        {details
          .filter(({ value }) => value && value.length > 0)
          .map(({ key, label, value, tooltip }) => (
            <KeyValueTableRow key={key}>
              <div
                data-testid={`${key}_label`}
                className="first-letter:uppercase"
              >
                {tooltip.length > 0 ? (
                  <Tooltip description={tooltip}>
                    <span>{label}</span>
                  </Tooltip>
                ) : (
                  <span>{label}</span>
                )}
              </div>
              <div data-testid={`${key}_value`}>{value}</div>
            </KeyValueTableRow>
          ))}
      </KeyValueTable>
    </div>
  ) : (
    <div className="py-12">
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
          Close
        </Button>
      </div>
    </Dialog>
  );
};
