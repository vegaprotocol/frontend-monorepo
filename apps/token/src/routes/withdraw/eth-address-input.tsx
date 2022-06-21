import {
  Button,
  Callout,
  FormGroup,
  Intent,
  Input,
} from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface EthAddressSelectorProps {
  address: string;
  connectedAddress: string;
  onChange: (newAddress: string) => void;
  isValid: boolean;
}

export const EthAddressInput = ({
  connectedAddress,
  address,
  onChange,
  isValid,
}: EthAddressSelectorProps) => {
  const { t } = useTranslation();
  const [useConnectedWallet, setUseConnectedWallet] =
    React.useState<boolean>(true);
  React.useEffect(() => {
    if (useConnectedWallet) {
      onChange(connectedAddress);
    }
  }, [connectedAddress, onChange, useConnectedWallet]);

  return (
    <FormGroup label={t('To')}>
      <Input
        data-testid="token-amount-input"
        className="token-input__input"
        name="ethAddressInput"
        onChange={(e) => onChange(e.target.value)}
        value={address}
        disabled={useConnectedWallet}
        // leftElement={<Ethereum />} TODO: render Ethereum icon in input when https://github.com/vegaprotocol/frontend-monorepo/issues/273
        autoComplete="off"
        type="text"
        required={true}
      />
      <div className="flex justify-center">
        <Button
          variant="inline-link"
          className="text-ui"
          onClick={() => setUseConnectedWallet(!useConnectedWallet)}
        >
          {useConnectedWallet ? t('enterAddress') : t('useConnectedWallet')}
        </Button>
      </div>
      {isValid ? null : (
        <Callout intent={Intent.Warning}>{t('invalidAddress')}</Callout>
      )}
    </FormGroup>
  );
};
