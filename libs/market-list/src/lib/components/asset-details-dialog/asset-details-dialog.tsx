import { gql, useQuery } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import type { Asset } from '@vegaprotocol/react-helpers';
import {
  Button,
  Dialog,
  Icon,
  Intent,
  Splash,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import type {
  AssetsConnection,
  AssetsConnection_assetsConnection_edges_node_source_ERC20,
} from './__generated__/AssetsConnection';
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

export const ASSETS_CONNECTION_QUERY = gql`
  query AssetsConnection {
    assetsConnection {
      edges {
        node {
          id
          name
          symbol
          decimals
          quantum
          source {
            ... on ERC20 {
              contractAddress
              lifetimeLimit
              withdrawThreshold
            }
          }
        }
      }
    }
  }
`;

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
  const { data } = useQuery<AssetsConnection>(ASSETS_CONNECTION_QUERY);
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
        value: (
          asset.node
            .source as AssetsConnection_assetsConnection_edges_node_source_ERC20
        ).contractAddress,
        tooltip: t(
          'The address of the contract for the token, on the ethereum network'
        ),
      },
      {
        key: 'withdrawalthreshold',
        label: t('Withdrawal threshold'),
        value: (
          asset.node
            .source as AssetsConnection_assetsConnection_edges_node_source_ERC20
        ).withdrawThreshold,
        tooltip: t(
          'The maximum allowed per withdraw note: this is a temporary measure for restricted mainnet'
        ),
      },
      {
        key: 'lifetimelimit',
        label: t('Lifetime limit'),
        value: (
          asset.node
            .source as AssetsConnection_assetsConnection_edges_node_source_ERC20
        ).lifetimeLimit,
        tooltip: t(
          'The lifetime limits deposit per address note: this is a temporary measure for restricted mainnet'
        ),
      },
    ];
  }

  const content = asset ? (
    <div className="pt-8 pb-20 table w-full">
      {details
        .filter(({ value }) => value && value.length > 0)
        .map(({ key, label, value, tooltip }) => (
          <div key={key} className="flex flex-col md:table-row">
            <div
              data-testid={`${key}_label`}
              className="table-cell w-1/3 py-2 first-letter:uppercase"
            >
              {tooltip.length > 0 ? (
                <Tooltip description={tooltip}>
                  <span className="underline underline-offset-2 decoration-dotted cursor-help">
                    {label}
                  </span>
                </Tooltip>
              ) : (
                <span>{label}</span>
              )}
            </div>
            <div
              data-testid={`${key}_value`}
              className="table-cell pb-5 md:pb-0"
            >
              {value}
            </div>
          </div>
        ))}
    </div>
  ) : (
    <div className="py-40">
      <Splash>{t('No data')}</Splash>
    </div>
  );

  return (
    <Dialog
      title={t(`Asset details - ${symbol}`)}
      intent={Intent.Primary}
      icon={<Icon name="info-sign"></Icon>}
      open={open}
      onChange={(isOpen) => onChange(isOpen)}
    >
      {content}
      <Button className="w-1/4" onClick={() => onChange(false)}>
        Close
      </Button>
    </Dialog>
  );
};
