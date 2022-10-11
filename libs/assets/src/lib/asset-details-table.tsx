import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import type { Schema } from '@vegaprotocol/types';
import type { KeyValueTableRowProps } from '@vegaprotocol/ui-toolkit';
import {
  KeyValueTable,
  KeyValueTableRow,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import type { Asset } from './asset-data-provider';

type Rows = {
  key: AssetDetail;
  label: string;
  tooltip: string;
  value: (asset: Asset) => string | null | undefined;
  valueTooltip?: (asset: Asset) => string | null | undefined;
}[];

export enum AssetDetail {
  ID,
  TYPE,
  NAME,
  SYMBOL,
  DECIMALS,
  QUANTUM,
  STATUS,
  // erc20 details:
  CONTRACT_ADDRESS,
  WITHDRAWAL_THRESHOLD,
  LIFETIME_LIMIT,
  // builtin details:
  MAX_FAUCET_AMOUNT_MINT,
  // balances:
  INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
  GLOBAL_REWARD_POOL_ACCOUNT_BALANCE,
  TAKER_FEE_REWARD_ACCOUNT_BALANCE,
  MAKER_FEE_REWARD_ACCOUNT_BALANCE,
  LP_FEE_REWARD_ACCOUNT_BALANCE,
  MARKET_PROPOSER_REWARD_ACCOUNT_BALANCE,
}

type Mapping = { [key in string]: { value: string; tooltip: string } };

const num = (asset: Asset, n: string | undefined | null) => {
  if (typeof n === 'undefined' || n == null) return '';
  return addDecimalsFormatNumber(n, asset.decimals);
};

export const rows: Rows = [
  {
    key: AssetDetail.ID,
    label: t('ID'),
    tooltip: '',
    value: (asset) => asset.id,
  },
  {
    key: AssetDetail.TYPE,
    label: t('Type'),
    tooltip: '',
    value: (asset) => AssetTypeMapping[asset.source.__typename].value,
    valueTooltip: (asset) => AssetTypeMapping[asset.source.__typename].tooltip,
  },
  {
    key: AssetDetail.NAME,
    label: t('Name'),
    tooltip: '',
    value: (asset) => asset.name,
  },
  {
    key: AssetDetail.SYMBOL,
    label: t('Symbol'),
    tooltip: '',
    value: (asset) => asset.symbol,
  },
  {
    key: AssetDetail.DECIMALS,
    label: t('Decimals'),
    tooltip: t('Number of decimal / precision handled by this asset'),
    value: (asset) => asset.decimals.toString(),
  },
  {
    key: AssetDetail.QUANTUM,
    label: t('Quantum'),
    tooltip: t('The minimum economically meaningful amount of the asset'),
    value: (asset) => asset.quantum,
  },
  {
    key: AssetDetail.STATUS,
    label: t('Status'),
    tooltip: t('The status of the asset in the Vega network'),
    value: (asset) => AssetStatusMapping[asset.status].value,
    valueTooltip: (asset) => AssetStatusMapping[asset.status].tooltip,
  },
  {
    key: AssetDetail.CONTRACT_ADDRESS,
    label: t('Contract address'),
    tooltip: t(
      'The address of the contract for the token, on the ethereum network'
    ),
    value: (asset) => (asset.source as Schema.ERC20).contractAddress,
  },
  {
    key: AssetDetail.WITHDRAWAL_THRESHOLD,
    label: t('Withdrawal threshold'),
    tooltip: t(
      'The maximum allowed per withdrawal. Note: this is a temporary measure for restricted mainnet'
    ),
    value: (asset) =>
      num(asset, (asset.source as Schema.ERC20).withdrawThreshold),
  },
  {
    key: AssetDetail.LIFETIME_LIMIT,
    label: t('Lifetime limit'),
    tooltip: t(
      'The lifetime deposit limit per address. Note: this is a temporary measure for restricted mainnet'
    ),
    value: (asset) => num(asset, (asset.source as Schema.ERC20).lifetimeLimit),
  },
  {
    key: AssetDetail.MAX_FAUCET_AMOUNT_MINT,
    label: t('Max faucet amount'),
    tooltip: t(
      'Maximum amount that can be requested by a party through the built-in asset faucet at a time'
    ),
    value: (asset) =>
      num(asset, (asset.source as Schema.BuiltinAsset).maxFaucetAmountMint),
  },
  {
    key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
    label: t('Infrastructure fee account balance'),
    tooltip: t('The infrastructure fee account for this asset'),
    value: (asset) => num(asset, asset.infrastructureFeeAccount.balance),
  },
  {
    key: AssetDetail.GLOBAL_REWARD_POOL_ACCOUNT_BALANCE,
    label: t('Global reward pool account balance'),
    tooltip: t('The global rewards acquired for this asset'),
    value: (asset) => num(asset, asset.globalRewardPoolAccount?.balance),
  },
  {
    key: AssetDetail.TAKER_FEE_REWARD_ACCOUNT_BALANCE,
    label: t('Taker fee reward account balance'),
    tooltip: t('The rewards acquired based on the taker fees for this asset'),
    value: (asset) => num(asset, asset.takerFeeRewardAccount?.balance),
  },
  {
    key: AssetDetail.MAKER_FEE_REWARD_ACCOUNT_BALANCE,
    label: t('Maker fee reward account balance'),
    tooltip: t('The rewards acquired based on the maker fees for this asset'),
    value: (asset) => num(asset, asset.makerFeeRewardAccount?.balance),
  },
  {
    key: AssetDetail.LP_FEE_REWARD_ACCOUNT_BALANCE,
    label: t('Liquidity provision fee reward account balance'),
    tooltip: t(
      'The rewards acquired based on the liquidity provision fees for this asset'
    ),
    value: (asset) => num(asset, asset.lpFeeRewardAccount?.balance),
  },
  {
    key: AssetDetail.MARKET_PROPOSER_REWARD_ACCOUNT_BALANCE,
    label: t('Market proposer reward account balance'),
    tooltip: t(
      'The rewards acquired based on the market proposer reward for this asset'
    ),
    value: (asset) => num(asset, asset.marketProposerRewardAccount?.balance),
  },
];

const AssetStatusMapping: Mapping = {
  STATUS_ENABLED: {
    value: t('Enabled'),
    tooltip: t('Asset can be used on the Vega network'),
  },
  STATUS_PENDING_LISTING: {
    value: t('Pending listing'),
    tooltip: t('Asset needs to be added to the Ethereum bridge'),
  },
  STATUS_PROPOSED: {
    value: t('Proposed'),
    tooltip: t('Asset has been proposed to the network'),
  },
  STATUS_REJECTED: {
    value: t('Rejected'),
    tooltip: t('Asset has been rejected'),
  },
};

const AssetTypeMapping: Mapping = {
  BuiltinAsset: {
    value: 'Builtin asset',
    tooltip: t('A Vega builtin asset'),
  },
  ERC20: {
    value: 'ERC20',
    tooltip: t('An asset originated from an Ethereum ERC20 Token'),
  },
};

export const testId = (detail: AssetDetail, field: 'label' | 'value') =>
  `${detail}_${field}`;

export type AssetDetailsTableProps = {
  asset: Asset;
} & Omit<KeyValueTableRowProps, 'children'>;
export const AssetDetailsTable = ({
  asset,
  ...props
}: AssetDetailsTableProps) => {
  const longStringModifiers = (key: AssetDetail, value: string) =>
    (value && key === AssetDetail.CONTRACT_ADDRESS) || key === AssetDetail.ID
      ? { className: 'truncate', title: value }
      : {};

  const details = rows.map((r) => ({
    ...r,
    value: r.value(asset),
    valueTooltip: r.valueTooltip?.(asset),
  }));

  return (
    <KeyValueTable>
      {details
        .filter(({ value }) => value && value.length > 0)
        .map(({ key, label, value, tooltip, valueTooltip }) => (
          <KeyValueTableRow key={key} {...props}>
            <div
              data-testid={testId(key, 'label')}
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
            <div
              data-testid={testId(key, 'value')}
              {...longStringModifiers(key, value as string)}
            >
              {valueTooltip && valueTooltip?.length > 0 ? (
                <Tooltip description={valueTooltip}>
                  <span>{value}</span>
                </Tooltip>
              ) : (
                value
              )}
            </div>
          </KeyValueTableRow>
        ))}
    </KeyValueTable>
  );
};
