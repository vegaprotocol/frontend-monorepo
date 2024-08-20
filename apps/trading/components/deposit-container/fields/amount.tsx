import {
  FormGroup,
  TradingInput,
  TradingInputError,
} from '@vegaprotocol/ui-toolkit';
import { type Control, Controller, useForm } from 'react-hook-form';
import { type FormFields } from '../deposit-form';
import {
  FormSecondaryActionButton,
  FormSecondaryActionWrapper,
} from '../../form-secondary-action';
import { useT } from '../../../lib/use-t';
import { type AssetERC20 } from '@vegaprotocol/assets';
import { toBigNum } from '@vegaprotocol/utils';

export function Amount(props: {
  control: Control<FormFields>;
  toAsset: AssetERC20 | undefined;
  balanceOf: string | undefined;
}) {
  const t = useT();
  const form = useForm();
  return (
    <FormGroup label="Amount" labelFor="amount">
      <Controller
        control={props.control}
        name="amount"
        render={({ field, fieldState }) => {
          return (
            <>
              <TradingInput {...field} />
              {fieldState.error && (
                <TradingInputError>
                  {fieldState.error.message}
                </TradingInputError>
              )}
            </>
          );
        }}
      />
      {props.toAsset && props.balanceOf && (
        <FormSecondaryActionWrapper>
          <FormSecondaryActionButton
            onClick={() => {
              if (!props.toAsset || !props.balanceOf) return;
              const amount = toBigNum(
                props.balanceOf || '0',
                props.toAsset.decimals
              ).toFixed(props.toAsset.decimals);

              form.setValue('amount', amount, { shouldValidate: true });
            }}
          >
            {t('Use maximum')}
          </FormSecondaryActionButton>
        </FormSecondaryActionWrapper>
      )}
    </FormGroup>
  );
}
