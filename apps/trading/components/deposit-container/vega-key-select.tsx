import { type ReactNode, useState } from 'react';
import { useT } from '../../lib/use-t';
import {
  FormSecondaryActionButton,
  FormSecondaryActionWrapper,
} from '../form-secondary-action';
import { useDialogStore, useVegaWallet } from '@vegaprotocol/wallet-react';

/** Switch between two render prop children for input or select */
export const VegaKeySelect = ({
  input,
  select,
  onChange,
}: {
  input: ReactNode;
  select: ReactNode;
  onChange: () => void;
}) => {
  const open = useDialogStore((store) => store.open);
  const { pubKeys, status } = useVegaWallet();
  const t = useT();
  const [isInputVegaKey, setIsInputVegaKey] = useState(() => {
    return Boolean(!pubKeys.length);
  });

  return (
    <>
      {isInputVegaKey ? input : select}
      <FormSecondaryActionWrapper>
        {status === 'connected' ? (
          <FormSecondaryActionButton
            onClick={() => {
              setIsInputVegaKey((x) => !x);
              onChange();
            }}
          >
            {isInputVegaKey ? t('Select from wallet') : t('Enter manually')}
          </FormSecondaryActionButton>
        ) : (
          <FormSecondaryActionButton onClick={open}>
            {t('Connect wallet')}
          </FormSecondaryActionButton>
        )}
      </FormSecondaryActionWrapper>
    </>
  );
};
