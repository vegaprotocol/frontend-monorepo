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

        if (key) {
          return (
            <div className="grid grid-cols-2 text-xs">
              <dt className="text-surface-1-fg-muted">{t('Recipient')}</dt>
              <dd className="text-right">
                <div>
                  {key.name} | {truncateMiddle(key.publicKey)}
                </div>
              </dd>
            </div>
          );
        }

        return (
          <FormGroup
            label={t('DEPOSIT_FIELD_TO_PUBKEY', { appName: APP_NAME })}
            labelFor="toPubKey"
          >
            <Input {...field} value={field.value} />
            {fieldState.error && (
              <TradingInputError>{fieldState.error.message}</TradingInputError>
            )}
          </FormGroup>
        );
      }}
    />
  );
}
