import { TradingInputError } from '@vegaprotocol/ui-toolkit';
import { useForm } from '../use-form';
import { FormGrid, FormGridCol } from '../elements/form';

import * as Fields from './index';

export const StopExpiry = () => {
  const form = useForm('stopLimit' as 'stopLimit' | 'stopMarket');
  const strategy = form.watch('stopExpiryStrategy');

  return (
    <div>
      <FormGrid>
        <FormGridCol>
          <Fields.StopExpiryStrategy />
        </FormGridCol>
        <FormGridCol>
          {strategy !== 'none' && <Fields.StopExpiresAt />}
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
