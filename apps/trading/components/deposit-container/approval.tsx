import { type QueryKey } from '@tanstack/react-query';
import { type AssetERC20 } from '@vegaprotocol/assets';
import { Intent, Notification } from '@vegaprotocol/ui-toolkit';

import { toBigNum, formatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { useEvmApprove } from '../../lib/hooks/use-evm-approve';
import { type EVMBridgeConfig, type EthereumConfig } from '@vegaprotocol/web3';

export const Approval = ({
  asset,
  amount: _amount,
  data,
  configs,
  queryKey,
}: {
  asset: AssetERC20;
  amount: string;
  data: {
    balanceOf: string;
    allowance: string;
    lifetimeLimit: string;
    isExempt: string;
  };
  configs: Array<EthereumConfig | EVMBridgeConfig>;
  queryKey: QueryKey;
}) => {
  const t = useT();

  const { submitApprove, data: dataApprove } = useEvmApprove({ queryKey });

  const allowance = toBigNum(data.allowance, asset.decimals);
  const amount = toBigNum(_amount, 0); // amount is raw user input so no need for decimals

  const handleActionClick = () => {
    const assetChainId = asset.source.chainId;
    const config = configs.find((c) => c.chain_id === assetChainId);
    const bridgeAddress = config?.collateral_bridge_contract
      .address as `0x${string}`;

    if (!bridgeAddress) {
      throw new Error(`no bridge found for asset ${asset.id}`);
    }

    submitApprove({ asset, bridgeAddress });
  };

  if (allowance.isZero()) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Warning}
          testId="approve-default"
          message={t(
            'Before you can make a deposit of your chosen asset, {{assetSymbol}}, you need to approve its use in your Ethereum wallet',
            { assetSymbol: asset.symbol }
          )}
          buttonProps={{
            size: 'small',
            text: dataApprove?.isPending
              ? t('Approval pending')
              : t('Approve {{assetSymbol}}', {
                  assetSymbol: asset.symbol,
                }),
            action: handleActionClick,
            dataTestId: 'approve-submit',
            disabled: dataApprove?.isPending,
          }}
        />
      </div>
    );
  }

  if (amount.isGreaterThan(allowance)) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Warning}
          testId="approve-default"
          message={t('Approve again to deposit more than {{allowance}}', {
            allowance: formatNumber(allowance),
          })}
          buttonProps={{
            size: 'small',
            text: dataApprove?.isPending
              ? t('Approval pending')
              : t('Approve {{assetSymbol}}', {
                  assetSymbol: asset.symbol,
                }),
            action: handleActionClick,
            dataTestId: 'approve-submit',
            disabled: dataApprove?.isPending,
          }}
        />
      </div>
    );
  }

  return null;
};
