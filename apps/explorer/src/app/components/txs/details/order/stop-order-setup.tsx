import { t } from '@vegaprotocol/i18n';
import type { components } from '../../../../../types/explorer';
import { wrapperClasses } from '../../../order-details/deterministic-order-details';
import { formatNumberPercentage } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import OrderTxSummary from '../../../order-summary/order-tx-summary';
import PriceInMarket from '../../../price-in-market/price-in-market';
import StopOrderTriggerSummary from './stop-order-trigger';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { Time } from '../../../time';
import { fromUnixTime, parse } from 'date-fns/esm';

export type StopOrderType = 'RisesAbove' | 'FallsBelow' | 'OCO';
type V1OrderSetup = components['schemas']['v1StopOrderSetup'];

interface StopOrderSetupProps extends V1OrderSetup {
  type: StopOrderType;
  deterministicId: string;
}

export function getExpiryTypeLabel(
  expiryStrategy: V1OrderSetup['expiryStrategy']
): string {
  switch (expiryStrategy) {
    case 'EXPIRY_STRATEGY_CANCELS':
      return t('Cancels');
    case 'EXPIRY_STRATEGY_SUBMIT':
      return t('Submit');
  }

  return expiryStrategy || t('Unknown');
}

export interface ExpiryTriggerProps {
  trailingPercentOffset?: string;
  price?: string;
  marketId?: string;
}

export function ExpiryTrigger({
  trailingPercentOffset,
  price,
  marketId,
}: ExpiryTriggerProps) {
  if (price && marketId) {
    return <PriceInMarket price={price} marketId={marketId} />;
  }
  if (trailingPercentOffset) {
    return (
      <span>
        {formatNumberPercentage(new BigNumber(trailingPercentOffset))}
      </span>
    );
  }

  return null;
}

export function getMovePrefix(
  type: StopOrderType,
  trailingPercentOffset?: string
): string {
  if (type === 'RisesAbove') {
    if (trailingPercentOffset) {
      return '+';
    } else {
      return '>';
    }
  } else {
    if (trailingPercentOffset) {
      return '-';
    } else {
      return '<';
    }
  }
}

export const TypeLabel = {
  RisesAbove: t('Take profit'),
  FallsBelow: t('Stop loss'),
  OCO: '',
};

/**
 */
export const StopOrderSetup = ({
  type,
  price,
  orderSubmission,
  expiresAt,
  expiryStrategy,
  trailingPercentOffset,
  deterministicId,
}: StopOrderSetupProps) => {
  let d = 'Unknown';
  try {
    d = expiresAt
      ? fromUnixTime(parseInt(expiresAt) / 1000000000).toLocaleString()
      : t('Unknown');
  } catch (e) {
    d = t('Unknown');
  }

  return (
    <div className={wrapperClasses}>
      <div className="mb-12 lg:mb-0">
        <div className="relative block rounded-lg px-3 py-6 md:px-6 lg:-mr-7">
          {orderSubmission && (
            <p className="text-vega-grey-400">
              <OrderTxSummary order={orderSubmission} />
            </p>
          )}

          <div className="grid md:grid-cols-4 gap-x-6 mt-4">
            <div className="mt-2">
              <h3 className="font-bold text-dark mb-1">{TypeLabel[type]} </h3>
              <p className=" font-xs text-gray-500 mb-0">
                {getMovePrefix(type, trailingPercentOffset)}
                <ExpiryTrigger
                  trailingPercentOffset={trailingPercentOffset}
                  price={price}
                  marketId={orderSubmission?.marketId}
                />
              </p>
            </div>

            <div className="mt-2">
              <h3 className="font-bold text-dark mb-1">{t('Triggered')}</h3>
              <StopOrderTriggerSummary id={deterministicId} />
            </div>

            {expiresAt && expiryStrategy ? (
              <div className="mt-2">
                <h3 className="font-bold text-dark mb-1">{t('Expiry Type')}</h3>
                <p className=" font-xs text-gray-500 mb-0">
                  <Tooltip description={<span>{d}</span>}>
                    <span>{getExpiryTypeLabel(expiryStrategy)}</span>
                  </Tooltip>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
