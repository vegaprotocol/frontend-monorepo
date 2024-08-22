import { useForm, useWatch } from 'react-hook-form';

import { Checkbox } from '@/components/checkbox';
import { LoadingButton } from '@/components/loading-button';
import { Intent } from '@vegaprotocol/ui-toolkit';

export const locators = {
  saveMnemonicButton: 'save-mnemonic-button',
  saveMnemonicForm: 'save-mnemonic-form',
};

export interface FormFields {
  acceptedTerms: boolean;
}

export const SaveMnemonicForm = ({
  onSubmit,
  loading,
  disabled,
}: {
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
}) => {
  const { control, handleSubmit } = useForm<FormFields>();
  const acceptedTerms = useWatch({ control, name: 'acceptedTerms' });
  return (
    <form
      data-testid={locators.saveMnemonicForm}
      className="mt-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Checkbox
        className="mb-8"
        name="acceptedTerms"
        label="I understand that if I lose my recovery phrase, I lose access to my wallet and keys."
        control={control}
        disabled={disabled || loading}
      />
      <LoadingButton
        loading={loading}
        text="Create wallet"
        loadingText="Creating wallet"
        data-testid={locators.saveMnemonicButton}
        fill={true}
        type="submit"
        intent={Intent.Primary}
        disabled={!acceptedTerms || loading || disabled}
      />
    </form>
  );
};
