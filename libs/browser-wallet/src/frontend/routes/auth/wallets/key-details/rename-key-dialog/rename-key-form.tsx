import { Button, FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useForm, useWatch } from 'react-hook-form';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { Validation } from '@/lib/form-validation';

import { FormFields } from './rename-key-dialog';

export const locators = {
  renameKeyInput: 'rename-key-input',
  renameKeySubmit: 'rename-key-submit',
};

export interface RenameKeyFormProperties {
  keyName: string;
  publicKey: string;
  onComplete: () => Promise<void>;
}

export const RenameKeyForm = ({
  keyName,
  publicKey,
  onComplete,
}: RenameKeyFormProperties) => {
  const { request } = useJsonRpcClient();
  const { register, handleSubmit, control } = useForm<FormFields>({
    defaultValues: {
      keyName: '',
    },
  });
  const renameKey = async ({ keyName }: FormFields) => {
    await request(RpcMethods.RenameKey, { publicKey, name: keyName });
    await onComplete();
  };
  const newKeyName = useWatch({ control, name: 'keyName' });
  const keyNameTooLong = newKeyName.length > 30;
  return (
    <form className="mt-4" onSubmit={handleSubmit(renameKey)}>
      <FormGroup label="Name" labelFor="keyName">
        <Input
          autoFocus
          hasError={keyNameTooLong}
          data-testid={locators.renameKeyInput}
          type="text"
          placeholder={keyName}
          {...register('keyName', {
            required: Validation.REQUIRED,
          })}
        />
        {keyNameTooLong && (
          <InputError forInput="keyName">
            Key name cannot be more than 30 character long
          </InputError>
        )}
      </FormGroup>
      <Button
        fill={true}
        data-testid={locators.renameKeySubmit}
        className="mt-2"
        variant="primary"
        type="submit"
        disabled={!newKeyName || keyNameTooLong || !newKeyName.trim()}
      >
        Rename
      </Button>
    </form>
  );
};
