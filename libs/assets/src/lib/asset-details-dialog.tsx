import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import type { Asset } from './assets-data-provider';
import { useAssetsDataProvider } from './assets-data-provider';
import {
  Button,
  Dialog,
  Icon,
  KeyValueTable,
  KeyValueTableRow,
  Splash,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
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
  key: AssetDetail;
  label: string;
  value: string | null | undefined;
  valueTooltip?: string;
  tooltip: string;
}[];

export interface AssetDetailsDialogProps {
  assetSymbol: string | Asset;
  trigger?: HTMLElement | null;
  open: boolean;
  onChange: (open: boolean) => void;
}

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

export const AssetStatusMapping: Mapping = {
  STATUS_ENABLED: {
    value: t('Enabled'),
    tooltip: t('Asset can be used on the Vega network'),
  },
  STATUS_PENDING_LISTING: {
    value: t('Pending listing'),
    tooltip: t('Asset is pending listing on the ethereum bridge'),
  },
  STATUS_PROPOSED: {
    value: t('Proposed'),
    tooltip: t('Asset is proposed to be added to the network'),
  },
  STATUS_REJECTED: {
    value: t('Rejected'),
    tooltip: t('Asset has been rejected'),
  },
};

export const AssetTypeMapping: Mapping = {
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

  let details: AssetDetails = [];
  if (asset != null) {
    const num = (n: string | undefined | null) => {
      if (typeof n === 'undefined' || n == null) return '';
      return addDecimalsFormatNumber(n, asset.decimals);
    };

    details = [
      {
        key: AssetDetail.ID,
        label: t('ID'),
        value: asset.id,
        tooltip: '',
      },
      {
        key: AssetDetail.TYPE,
        label: t('Type'),
        value: AssetTypeMapping[asset.source.__typename].value,
        valueTooltip: AssetTypeMapping[asset.source.__typename].tooltip,
        tooltip: '',
      },
      {
        key: AssetDetail.NAME,
        label: t('Name'),
        value: asset.name,
        tooltip: '',
      },
      {
        key: AssetDetail.SYMBOL,
        label: t('Symbol'),
        value: asset.symbol,
        tooltip: '',
      },
      {
        key: AssetDetail.DECIMALS,
        label: t('Decimals'),
        value: asset.decimals.toString(),
        tooltip: t('Number of decimal / precision handled by this asset'),
      },
      {
        key: AssetDetail.QUANTUM,
        label: t('Quantum'),
        value: asset.quantum,
        tooltip: t('The minimum economically meaningful amount in the asset'),
      },
      {
        key: AssetDetail.STATUS,
        label: t('Status'),
        value: AssetStatusMapping[asset.status].value,
        valueTooltip: AssetStatusMapping[asset.status].tooltip,
        tooltip: t('The status of the asset in the Vega network'),
      },
      {
        key: AssetDetail.CONTRACT_ADDRESS,
        label: t('Contract address'),
        value: (asset.source as Schema.ERC20).contractAddress,
        tooltip: t(
          'The address of the contract for the token, on the ethereum network'
        ),
      },
      {
        key: AssetDetail.WITHDRAWAL_THRESHOLD,
        label: t('Withdrawal threshold'),
        value: num((asset.source as Schema.ERC20).withdrawThreshold),
        tooltip: t(
          'The maximum allowed per withdraw note: this is a temporary measure for restricted mainnet'
        ),
      },
      {
        key: AssetDetail.LIFETIME_LIMIT,
        label: t('Lifetime limit'),
        value: num((asset.source as Schema.ERC20).lifetimeLimit),
        tooltip: t(
          'The lifetime limits deposit per address note: this is a temporary measure for restricted mainnet'
        ),
      },
      {
        key: AssetDetail.MAX_FAUCET_AMOUNT_MINT,
        label: t('Max faucet amount'),
        value: num((asset.source as Schema.BuiltinAsset).maxFaucetAmountMint),
        tooltip: t(
          'Maximum amount that can be requested by a party through the built-in asset faucet at a time'
        ),
      },
      {
        key: AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
        label: t('Infrastructure fee account balance'),
        value: num(asset.infrastructureFeeAccount.balance),
        tooltip: t('The infrastructure fee account for this asset'),
      },
      {
        key: AssetDetail.GLOBAL_REWARD_POOL_ACCOUNT_BALANCE,
        label: t('Global reward pool account balance'),
        value: num(asset.globalRewardPoolAccount?.balance),
        tooltip: t('The global reward pool account for this asset'),
      },
      {
        key: AssetDetail.TAKER_FEE_REWARD_ACCOUNT_BALANCE,
        label: t('Taker fee reward account balance'),
        value: num(asset.takerFeeRewardAccount?.balance),
        tooltip: t('The taker fee reward account for this asset'),
      },
      {
        key: AssetDetail.MAKER_FEE_REWARD_ACCOUNT_BALANCE,
        label: t('Maker fee reward account balance'),
        value: num(asset.makerFeeRewardAccount?.balance),
        tooltip: t('The maker fee reward account for this asset'),
      },
      {
        key: AssetDetail.LP_FEE_REWARD_ACCOUNT_BALANCE,
        label: t('Liquidity provision fee reward account balance'),
        value: num(asset.lpFeeRewardAccount?.balance),
        tooltip: t('The liquidity provision reward account for this asset'),
      },
      {
        key: AssetDetail.MARKET_PROPOSER_REWARD_ACCOUNT_BALANCE,
        label: t('Market proposer reward account balance'),
        value: num(asset.marketProposerRewardAccount?.balance),
        tooltip: t('The market proposer reward account for this asset'),
      },
    ];
  }

  const content = asset ? (
    <div className="my-2">
      <KeyValueTable>
        {details
          .filter(({ value }) => value && value.length > 0)
          .map(({ key, label, value, tooltip, valueTooltip }) => (
            <KeyValueTableRow key={key}>
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
              <div data-testid={testId(key, 'value')}>
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
