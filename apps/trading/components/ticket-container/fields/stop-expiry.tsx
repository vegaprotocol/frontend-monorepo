import { TradingInputError } from '@vegaprotocol/ui-toolkit';
import { useForm } from '../use-form';
import { FormGrid, FormGridCol } from '../elements/form';

import * as Fields from './index';
import { StopOrderExpiryStrategy } from '@vegaprotocol/types';

export const StopExpiry = () => {
  const form = useForm('stopLimit' as 'stopLimit' | 'stopMarket');

  const stopExpiryStrategy = form.watch('stopExpiryStrategy');

  return (
    <div>
      <FormGrid>
        <FormGridCol>
          <Fields.StopExpiryStrategy />
        </FormGridCol>
        <FormGridCol>
          {stopExpiryStrategy !== undefined &&
            stopExpiryStrategy !==
              StopOrderExpiryStrategy.EXPIRY_STRATEGY_UNSPECIFIED && (
              <Fields.StopExpiresAt />
            )}
        </FormGridCol>
      </FormGrid>
      {form.formState.errors.stopExpiresAt && (
        <TradingInputError>
          {form.formState.errors.stopExpiresAt.message}
        </TradingInputError>
      )}
    </div>
  );
};
