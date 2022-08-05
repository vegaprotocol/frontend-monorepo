import { gql, useQuery } from '@apollo/client';
import { formatNumber, t, toBigNum } from '@vegaprotocol/react-helpers';
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

export type AssetDetailsDialogState = {
  isAssetDetailsDialogOpen: boolean;
  assetDetailsDialogSymbol: string | Asset;
};

export const DEFAULT_ASSET_DETAILS_STATE: AssetDetailsDialogState = {
  isAssetDetailsDialogOpen: false,
  assetDetailsDialogSymbol: '',
};

type Dictionary<T> = {
  [index: string]: T;
};

export const ASSETS_CONNECTION_QUERY = gql`
  query AssetsConnection {
    assetsConnection {
      edges {
        node {
          id
          name
          symbol
          totalSupply
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

const ASSET_DETAILS_DICTIONARY: Dictionary<string> = {
  Name: '', // 'Name of the asset (e.g: Great British Pound)',
  Symbol: '', // 'Symbol of the asset (e.g: GBP)',
  Decimals: 'Number of decimal / precision handled by this asset',
  Quantum: 'The minimum economically meaningful amount in the asset',
  TotalSupply: 'Total circulating supply for the asset',
  ContractAddress:
    'The address of the contract for the token, on the ethereum network',
  WithdrawalThreshold:
    'The maximum allowed per withdraw note: this is a temporary measure for restricted mainnet',
  LifetimeLimit:
    'The lifetime limits deposit per address note: this is a temporary measure for restricted mainnet',
};

const w = (key: string) =>
  key
    .replace(/([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g, '$1$4 $2$3$5')
    .toLowerCase();

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

  let details: Dictionary<string> = {};
  if (asset != null) {
    const totalSupply = formatNumber(toBigNum(asset.node.totalSupply, 0));
    details = {
      Name: asset.node.name,
      Symbol: asset.node.symbol,
      Decimals: asset.node.decimals.toString(),
      Quantum: asset.node.quantum,
      TotalSupply: totalSupply,
      ContractAddress: (
        asset.node
          .source as AssetsConnection_assetsConnection_edges_node_source_ERC20
      ).contractAddress,
      WithdrawalThreshold: (
        asset.node
          .source as AssetsConnection_assetsConnection_edges_node_source_ERC20
      ).withdrawThreshold,
      LifetimeLimit: (
        asset.node
          .source as AssetsConnection_assetsConnection_edges_node_source_ERC20
      ).lifetimeLimit,
    };
  }

  const content = asset ? (
    <div className="pt-8 pb-20 table w-full">
      {Object.keys(details)
        .filter((key) => details[key] && details[key].length > 0)
        .map((key) => (
          <div key={key} className="flex flex-col md:table-row">
            <div
              data-testid={`${key}_key`}
              className="table-cell w-1/3 py-2 first-letter:uppercase"
            >
              {ASSET_DETAILS_DICTIONARY[key].length > 0 ? (
                <Tooltip description={ASSET_DETAILS_DICTIONARY[key]}>
                  <span className="underline underline-offset-2 decoration-dotted cursor-help">
                    {w(key)}
                  </span>
                </Tooltip>
              ) : (
                <span>{t(w(key))}</span>
              )}
            </div>
            <div data-testid={`${key}_val`} className="table-cell pb-5 md:pb-0">
              {t(details[key])}
            </div>
          </div>
        ))}
    </div>
  ) : (
    <div className="py-40">
      <Splash>{t('No data')}</Splash>
    </div>
  );

  // TODO: styling
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
