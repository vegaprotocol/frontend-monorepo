import { t } from '@vegaprotocol/i18n';
import type { components } from '../../../../../types/explorer';
import DeterministicOrderDetails, {
  wrapperClasses,
} from '../../../order-details/deterministic-order-details';
import { formatNumberPercentage } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import OrderTxSummary from '../../../order-summary/order-tx-summary';
import PriceInMarket from '../../../price-in-market/price-in-market';

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
        {formatNumberPercentage(new BigNumber(trailingPercentOffset))}%
      </span>
    );
  }

  return null;
}

export const TypeLabel = {
  RisesAbove: t('Rises by'),
  FallsBelow: t('Falls by'),
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
  return (
    <div className={wrapperClasses}>
      {deterministicId}
      <div className="mb-12 lg:mb-0">
        <div className="relative block rounded-lg px-3 py-6 md:px-6 lg:-mr-7">
          <h2 className="text-3xl font-bold mb-4 display-5">
            {TypeLabel[type]}{' '}
            <ExpiryTrigger
              trailingPercentOffset={trailingPercentOffset}
              price={price}
              marketId={orderSubmission?.marketId}
            />
          </h2>
          {orderSubmission && (
            <p className="text-vega-grey-400">
              <OrderTxSummary order={orderSubmission} />
            </p>
          )}
          <DeterministicOrderDetails id={deterministicId} />
          {expiresAt && expiryStrategy ? (
            <div className="">
              <h2 className="text-2xl font-bold text-dark mb-4">
                {t('Expiry Type')}
              </h2>
              <h5 className="text-lg font-medium text-gray-500 mb-0">
                {getExpiryTypeLabel(expiryStrategy)}
              </h5>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
