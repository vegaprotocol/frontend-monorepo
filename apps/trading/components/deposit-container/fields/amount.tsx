import {
  FormGroup,
  TradingInput,
  TradingInputError,
} from '@vegaprotocol/ui-toolkit';
import { type Control, Controller, useFormContext } from 'react-hook-form';
import { type FormFields } from '../form-schema';
import {
  FormSecondaryActionButton,
  FormSecondaryActionWrapper,
} from '../../form-secondary-action';
import { useT } from '../../../lib/use-t';
import type BigNumber from 'bignumber.js';
import { isAssetNative } from '@vegaprotocol/utils';

export function Amount(props: {
  control: Control<FormFields>;
  balanceOf: BigNumber | undefined;
  nativeBalanceOf: BigNumber | undefined;
}) {
  const t = useT();
  const form = useFormContext<FormFields>();
  return (
    <Controller
      control={props.control}
      name="amount"
      render={({ field, fieldState }) => {
        return (
          <FormGroup label="Amount" labelFor="amount">
            <TradingInput {...field} />
            {fieldState.error && (
              <TradingInputError>{fieldState.error.message}</TradingInputError>
            )}
            <FormSecondaryActionWrapper>
              <FormSecondaryActionButton
                onClick={() => {
                  const fromAsset = form.getValues('fromAsset');

                  const value = isAssetNative(fromAsset)
                    ? props.nativeBalanceOf?.toString() || '0'
                    : props.balanceOf?.toString() || '0';

                  form.setValue('amount', value, {
                    shouldValidate: true,
                  });
                }}
              >
                {t('Use maximum')}
              </FormSecondaryActionButton>
            </FormSecondaryActionWrapper>
          </FormGroup>
        );
      }}
    />
  );
}
