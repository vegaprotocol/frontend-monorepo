import {
  Dialog,
  FormGroup,
  Input,
  InputError,
  Intent,
  TradingButton,
} from '@vegaprotocol/ui-toolkit';
import { useProfileDialogStore } from '../../stores/profile-dialog-store';
import { useForm } from 'react-hook-form';
import { useT } from '../../lib/use-t';
import { useRequired } from '@vegaprotocol/utils';
import { useSimpleTransaction, type Status } from '@vegaprotocol/wallet';

export const ProfileDialog = () => {
  const t = useT();
  const open = useProfileDialogStore((store) => store.open);
  const setOpen = useProfileDialogStore((store) => store.setOpen);

  const { send, status, error, reset } = useSimpleTransaction();

  const sendTx = (field: FormFields) => {
    send({
      updatePartyProfile: {
        // TODO: alias validation
        alias: field.alias,
        metadata: [],
      },
    });
  };

  return (
    <Dialog
      open={open}
      onChange={(o) => {
        setOpen(o);
        reset();
      }}
      title={t('Set party alias')}
    >
      <ProfileForm status={status} error={error} onSubmit={sendTx} />
    </Dialog>
  );
};

interface FormFields {
  alias: string;
}

const ProfileForm = ({
  onSubmit,
  status,
  error,
}: {
  onSubmit: (fields: FormFields) => void;
  status: Status;
  error: string | undefined;
}) => {
  const t = useT();
  const required = useRequired();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>();

  const renderButtonText = () => {
    if (status === 'requested') {
      return t('Confirm in wallet...');
    }

    if (status === 'pending') {
      return t('Awaiting transaction...');
    }

    return t('Submit');
  };

  const errorMessage = errors.alias?.message || error;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
      <FormGroup label="Alias" labelFor="alias">
        <Input
          {...register('alias', {
            validate: {
              required,
            },
          })}
        />
        {errorMessage && (
          <InputError>
            <p className="break-words max-w-full">{errorMessage}</p>
          </InputError>
        )}
      </FormGroup>
      <TradingButton
        type="submit"
        intent={Intent.Info}
        disabled={status === 'requested' || status === 'pending'}
      >
        {renderButtonText()}
      </TradingButton>
    </form>
  );
};
