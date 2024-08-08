import { t } from '@vegaprotocol/i18n';
import type { components } from '../../../../../types/explorer';
import { formatNumberPercentage } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import PriceInMarket from '../../../price-in-market/price-in-market';
import StopOrderTriggerSummary from './stop-order-trigger';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import fromUnixTime from 'date-fns/fromUnixTime';

const wrapperClasses =
  'flex-1 max-w-xs items-center border border-gs-200  rounded-md pv-2 ph-5 mb-5';

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
        {formatNumberPercentage(new BigNumber(trailingPercentOffset))}{' '}
        (trailing)
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
  RisesAbove: t('Rises above ↗'),
  FallsBelow: t('Falls below ↘'),
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
        <div className="bg-gs-900 text-gs-50 px-6 py-2 md:px-6 flex">
          <div className="flex-1">
            <strong className="font-bold mb-1">{TypeLabel[type]} </strong>
            <p className=" font-xs mb-0">
              {getMovePrefix(type, trailingPercentOffset)}
              <ExpiryTrigger
                trailingPercentOffset={trailingPercentOffset}
                price={price}
                marketId={orderSubmission?.marketId}
              />
            </p>
          </div>

          {expiresAt && expiryStrategy ? (
            <div className="flex-1">
              <strong className="font-bold mb-1">{t('Expiry Type')}</strong>
              <p className=" font-xs mb-0">
                <Tooltip description={<span>{d}</span>}>
                  <span>{getExpiryTypeLabel(expiryStrategy)}</span>
                </Tooltip>
              </p>
            </div>
          ) : null}
        </div>
        <StopOrderTriggerSummary
          id={deterministicId}
          orderSubmission={orderSubmission}
        />
      </div>
    </div>
  );
};
