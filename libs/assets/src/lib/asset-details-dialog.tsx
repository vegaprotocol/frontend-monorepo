import { t } from '@vegaprotocol/react-helpers';
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
  isAssetDetailsDialogOpen: boolean;
  assetDetailsDialogSymbol: string | Asset;
  setAssetDetailsDialogOpen: (isOpen: boolean) => void;
  setAssetDetailsDialogSymbol: (symbol: string | Asset) => void;
};

export const useAssetDetailsDialogStore = create<AssetDetailsDialogStore>(
  (set) => ({
    isAssetDetailsDialogOpen: false,
    assetDetailsDialogSymbol: '',
    setAssetDetailsDialogOpen: (isOpen: boolean) => {
      set({ isAssetDetailsDialogOpen: isOpen });
    },
    setAssetDetailsDialogSymbol: (symbol: string | Asset) => {
      set({ assetDetailsDialogSymbol: symbol });
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
  open: boolean;
  onChange: (open: boolean) => void;
}

export const AssetDetailsDialog = ({
  assetSymbol,
  open,
  onChange,
}: AssetDetailsDialogProps) => {
  const { data } = useAssetsConnectionQuery();
  const symbol =
    typeof assetSymbol === 'string' ? assetSymbol : assetSymbol.symbol;
  const asset = data?.assetsConnection.edges?.find(
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
        value: (asset.node.source as Schema.ERC20).withdrawThreshold,
        tooltip: t(
          'The maximum allowed per withdraw note: this is a temporary measure for restricted mainnet'
        ),
      },
      {
        key: 'lifetimelimit',
        label: t('Lifetime limit'),
        value: (asset.node.source as Schema.ERC20).lifetimeLimit,
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
    >
      {content}
      <div className="w-1/4">
        <Button fill={true} size="sm" onClick={() => onChange(false)}>
          Close
        </Button>
      </div>
    </Dialog>
  );
};
