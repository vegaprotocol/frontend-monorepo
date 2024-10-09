import {
  FormGroup,
  Input,
  TradingInputError,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import { type Control, Controller } from 'react-hook-form';
import { type FormFields } from '../form-schema';
import { useT } from '../../../lib/use-t';
import { APP_NAME } from '../../../lib/constants';
import { type Key } from '@vegaprotocol/wallet';

export function ToPubKey(props: {
  control: Control<FormFields>;
  pubKeys: Key[];
}) {
  const t = useT();
  return (
    <Controller
      name="toPubKey"
      control={props.control}
      render={({ field, fieldState }) => {
        const key = props.pubKeys.find((p) => p.publicKey === field.value);

        return (
          <FormGroup
            label={t('DEPOSIT_FIELD_TO_PUBKEY', { appName: APP_NAME })}
            labelFor="toPubKey"
          >
            {key ? (
              <div className="text-sm leading-4">
                <div>{key.name}</div>
                <div className="text-xs text-surface-0-fg-muted">
                  {truncateMiddle(key.publicKey)}
                </div>
              </div>
            ) : (
              <Input {...field} value={field.value} />
            )}
            {fieldState.error && (
              <TradingInputError>{fieldState.error.message}</TradingInputError>
            )}
          </FormGroup>
        );
      }}
    />
  );
}
