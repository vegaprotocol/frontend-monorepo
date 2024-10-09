import { type Control, Controller, useFormContext } from 'react-hook-form';

import { useAccount, useDisconnect, useChainId, useAccountEffect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';

import {
  FormGroup,
  Button,
  TradingInputError,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import { Emblem } from '@vegaprotocol/emblem';

import { useT } from '../../../lib/use-t';

import { type FormFields } from '../form-schema';

import {
  FormSecondaryActionButton,
  FormSecondaryActionWrapper,
} from '../../form-secondary-action';

export function FromAddress(props: { control: Control<FormFields> }) {
  const t = useT();
  const form = useFormContext();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  useAccountEffect({
    onConnect: ({ address }) => {
      form.setValue('fromAddress', address, { shouldValidate: true });
    },
    onDisconnect: () => form.setValue('fromAddress', ''),
  });

  return (
    <FormGroup label={t('From address')} labelFor="fromAddress">
      <Controller
        name="fromAddress"
        control={props.control}
        render={({ fieldState }) => {
          return (
            <>
              {isConnected ? (
                <div className="flex items-center gap-1">
                  <Emblem chainId={chainId} />
                  <input
                    value={address}
                    readOnly
                    className="appearance-none bg-transparent text-sm text-muted w-full focus:outline-none"
                    tabIndex={-1}
                  />
                  <FormSecondaryActionWrapper>
                    <FormSecondaryActionButton onClick={() => disconnect()}>
                      {t('Disconnect')}
                    </FormSecondaryActionButton>
                  </FormSecondaryActionWrapper>
                </div>
              ) : (
                <ConnectKitButton.Custom>
                  {({ show }) => {
                    return (
                      <Button
                        type="button"
                        onClick={() => {
                          if (show) show();
                        }}
                        intent={Intent.Info}
                        size="sm"
                      >
                        {t('Connect')}
                      </Button>
                    );
                  }}
                </ConnectKitButton.Custom>
              )}
              {fieldState.error && (
                <TradingInputError>
                  {fieldState.error.message}
                </TradingInputError>
              )}
            </>
          );
        }}
      />
    </FormGroup>
  );
}
