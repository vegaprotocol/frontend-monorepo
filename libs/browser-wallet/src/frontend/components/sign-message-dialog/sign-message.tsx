import { Button, Intent, InputError, TextArea } from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';

import { Validation } from '@/lib/form-validation';

export const locators = {
  messageInput: 'message-input',
  cancelButton: 'cancel-button',
  signButton: 'sign-button',
  messageDescription: 'message-description',
  signMessageHeader: 'sign-message-header',
};

interface SignMessageProperties {
  onCancel: () => void;
  onSign: ({ message }: { message: string }) => void;
  disabled: boolean;
}

const SignMessageForm = ({
  onCancel,
  onSign,
  disabled,
}: SignMessageProperties) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ message: string }>();
  return (
    <form onSubmit={handleSubmit(onSign)}>
      <TextArea
        {...register('message', {
          required: Validation.REQUIRED,
        })}
        autoFocus
        placeholder="Enter a message"
        data-testid={locators.messageInput}
      />
      {errors.message?.message && (
        <InputError forInput="confirmPassword">
          {errors.message.message}
        </InputError>
      )}
      <div className="mt-4 flex justify-between">
        <Button
          disabled={disabled}
          onClick={onCancel}
          data-testid={locators.cancelButton}
        >
          Cancel
        </Button>
        <Button
          disabled={disabled}
          type="submit"
          intent={Intent.Secondary}
          data-testid={locators.signButton}
        >
          Sign
        </Button>
      </div>
    </form>
  );
};

export const SignMessage = ({
  onCancel,
  onSign,
  disabled,
}: SignMessageProperties) => {
  return (
    <div className="p-2 text-center text-base  text-vega-dark-400">
      <h1
        data-testid={locators.signMessageHeader}
        className="text-xl text-white mb-2"
      >
        Sign Message
      </h1>
      <p className="mb-3" data-testid={locators.messageDescription}>
        Enter the message you want to encrypt.
      </p>
      <SignMessageForm
        onCancel={onCancel}
        onSign={onSign}
        disabled={disabled}
      />
    </div>
  );
};
