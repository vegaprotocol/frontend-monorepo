import { TradingInputError } from '@vegaprotocol/ui-toolkit';
import { useForm } from '../use-form';
import { FormGrid, FormGridCol } from '../elements/form';

import * as Fields from './index';
import { StopOrderExpiryStrategy } from '@vegaprotocol/types';

export const OCOStopExpiry = () => {
  const form = useForm('stopLimit' as 'stopLimit' | 'stopMarket');

  const ocoStopExpiryStrategy = form.watch('ocoStopExpiryStrategy');

  return (
    <div>
      <FormGrid>
        <FormGridCol>
          <Fields.StopExpiryStrategy name="ocoStopExpiryStrategy" />
        </FormGridCol>
        <FormGridCol>
          {ocoStopExpiryStrategy !== undefined &&
            ocoStopExpiryStrategy !==
              StopOrderExpiryStrategy.EXPIRY_STRATEGY_UNSPECIFIED && (
              <Fields.StopExpiresAt name="ocoStopExpiresAt" />
            )}
        </FormGridCol>
      </FormGrid>
      {form.formState.errors.ocoStopExpiresAt && (
        <TradingInputError>
          {form.formState.errors.ocoStopExpiresAt.message}
        </TradingInputError>
      )}
    </div>
  );
};
