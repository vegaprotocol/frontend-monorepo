import {
  FormGroup,
  InputGroup,
  Intent as BlueprintIntent,
} from '@blueprintjs/core';
import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
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
      <InputGroup
        data-testid="token-amount-input"
        className="token-input__input"
        name="ethAddressInput"
        onChange={(e) => onChange(e.target.value)}
        value={address}
        disabled={useConnectedWallet}
        intent={BlueprintIntent.NONE}
        leftElement={<Ethereum />}
        autoComplete="off"
        type="text"
        required={true}
      />
      <button
        type="button"
        onClick={() => setUseConnectedWallet(!useConnectedWallet)}
        className="button-link fill"
      >
        {useConnectedWallet ? t('enterAddress') : t('useConnectedWallet')}
      </button>

      {isValid ? null : (
        <Callout intent={Intent.Warning}>{t('invalidAddress')}</Callout>
      )}
    </FormGroup>
  );
};
