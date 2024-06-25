import { Trans } from 'react-i18next';
import { formatDistanceStrict } from 'date-fns';

import { type AssetERC20 } from '@vegaprotocol/assets';
import { Intent, Notification, Tooltip } from '@vegaprotocol/ui-toolkit';
import { formatNumber, toBigNum } from '@vegaprotocol/utils';

import { useT } from '../../lib/use-t';

export const Thresholds = ({
  amount: _amount,
  asset,
  data,
}: {
  amount: string;
  asset: AssetERC20;
  data: {
    delay: string;
    threshold: string;
  };
}) => {
  const t = useT();
  const amount = toBigNum(_amount, 0); // raw user input so no need for decimals
  const threshold = toBigNum(data.threshold, asset.decimals);

  const delayTime = formatDistanceStrict(
    Date.now(),
    Date.now() + Number(data.delay) * 1000
  );

  if (amount.isGreaterThan(threshold)) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Warning}
          testId="approve-default"
          message={
            <p>
              <Tooltip
                description={
                  <dl className="grid gap-1 grid-cols-2">
                    <dt>{t('Delay threshold')}</dt>
                    <dd className="text-right">
                      {formatNumber(data.threshold)}
                    </dd>
                    <dt>{t('Delay time')}</dt>
                    <dd className="text-right break-all">{delayTime}</dd>
                  </dl>
                }
              >
                <span>
                  <Trans
                    i18nKey="Withdrawals over the <0>delay threshold</0> will be delayed for {{time}}"
                    values={{
                      time: delayTime,
                    }}
                    components={[
                      <span
                        className="underline underline-offset-4"
                        key="tooltip"
                      >
                        delay threshold
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

  return null;
};
