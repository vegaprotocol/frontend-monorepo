import {
  FormGroup,
  Input,
  TradingInputError,
  TradingRichSelect,
  TradingRichSelectOption,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import { type Control, Controller, useFormContext } from 'react-hook-form';
import { VegaKeySelect } from '../vega-key-select';
import { type FormFields } from '../form-schema';
import { type Key } from '@vegaprotocol/wallet';
import { useT } from '../../../lib/use-t';

export function ToPubKey(props: {
  control: Control<FormFields>;
  pubKeys: Key[];
}) {
  const t = useT();
  const form = useFormContext();
  return (
    <Controller
      name="toPubKey"
      control={props.control}
      render={({ field, fieldState }) => {
        return (
          <FormGroup label={t('To (Vega key)')} labelFor="toPubKey">
            <VegaKeySelect
              onChange={() => form.setValue('toPubKey', '')}
              input={<Input {...field} />}
              select={
                <TradingRichSelect
                  placeholder={t('Select public key')}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  {props.pubKeys.map((k) => {
                    return (
                      <TradingRichSelectOption
                        value={k.publicKey}
                        key={k.publicKey}
                      >
                        <div className="leading-4">
                          <div>{k.name}</div>
                          <div className="text-xs text-secondary">
                            {truncateMiddle(k.publicKey)}
                          </div>
                        </div>
                      </TradingRichSelectOption>
                    );
                  })}
                </TradingRichSelect>
              }
            />
            {fieldState.error && (
              <TradingInputError>{fieldState.error.message}</TradingInputError>
            )}
          </FormGroup>
        );
      }}
    />
  );
}
