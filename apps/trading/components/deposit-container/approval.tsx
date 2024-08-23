import { type QueryKey } from '@tanstack/react-query';
import { type AssetERC20 } from '@vegaprotocol/assets';
import { Intent, Notification, Tooltip } from '@vegaprotocol/ui-toolkit';

import { formatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { useEvmApprove } from '../../lib/hooks/use-evm-approve';
import { type EVMBridgeConfig, type EthereumConfig } from '@vegaprotocol/web3';
import { Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';

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
    balanceOf: BigNumber;
    allowance: BigNumber;
    lifetimeLimit: BigNumber;
    deposited: BigNumber;
  };
  configs: Array<EthereumConfig | EVMBridgeConfig>;
  queryKey: QueryKey;
}) => {
  const { allowance, deposited, lifetimeLimit } = data;

  const t = useT();

  const { submitApprove, data: dataApprove } = useEvmApprove({ queryKey });

  const amount = BigNumber(_amount); // amount is raw user input so no need for decimals

  const handleActionClick = () => {
    const assetChainId = asset.source.chainId;
    const config = configs.find((c) => c.chain_id === assetChainId);
    const bridgeAddress = config?.collateral_bridge_contract.address;

    if (!bridgeAddress) {
      throw new Error(`no bridge found for asset ${asset.id}`);
    }

    submitApprove({ asset, bridgeAddress });
  };

  if (deposited.isGreaterThanOrEqualTo(lifetimeLimit)) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Warning}
          testId="deposited-capped"
          message={
            <p>
              <Tooltip
                description={
                  <dl className="grid gap-1 grid-cols-[min-content_1fr]">
                    <dt>{t('Deposited')}</dt>
                    <dd className="text-right">{formatNumber(deposited)}</dd>
                    <dt>{t('Capped at')}</dt>
                    <dd className="text-right break-all">
                      {formatNumber(lifetimeLimit)}
                    </dd>
                  </dl>
                }
              >
                <span>
                  <Trans
                    i18nKey="You have deposited more than the <0>lifetime deposit</0> cap for this asset."
                    components={[
                      <span
                        className="underline underline-offset-4"
                        key="tooltip"
                      >
                        lifetime deposit
                      </span>,
                    ]}
                  />
                </span>
              </Tooltip>
            </p>
          }
        />
      </div>
    );
  }

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
            size: 'sm',
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
            size: 'sm',
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
