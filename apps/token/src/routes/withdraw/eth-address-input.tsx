import {
  Button,
  Callout,
  FormGroup,
  Intent,
  Input,
} from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Ethereum } from '../../components/icons';

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
    <FormGroup label={t('To')} labelFor="ethAddressInput">
      <Input
        data-testid="token-amount-input"
        className="token-input__input"
        name="ethAddressInput"
        onChange={(e) => onChange(e.target.value)}
        value={address}
        disabled={useConnectedWallet}
        // TODO: TFE import
        // leftElement={<Ethereum />}
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
