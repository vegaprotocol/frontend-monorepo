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
import { useSimpleTransaction } from '@vegaprotocol/wallet';

export const ProfileDialog = () => {
  const t = useT();
  const open = useProfileDialogStore((store) => store.open);
  const setOpen = useProfileDialogStore((store) => store.setOpen);

  return (
    <Dialog open={open} onChange={setOpen} title={t('Set party alias')}>
      <ProfileFormContainer />
    </Dialog>
  );
};

const ProfileFormContainer = () => {
  const { send, status, error } = useSimpleTransaction();

  const sendTx = (field: FormFields) => {
    send({
      updatePartyProfile: {
        // TODO: alias validation
        alias: field.alias,
        metadata: [],
      },
    });
  };

  if (error) {
    return <p className="break-words">{error}</p>;
  }

  if (status === 'pending') {
    return <p>Pending</p>;
  }

  if (status === 'requested') {
    return <p>Confirm in wallet</p>;
  }

  if (status === 'confirmed') {
    return <p>Transaction sent</p>;
  }

  if (status === 'idle') {
    return <ProfileForm onSubmit={sendTx} />;
  }
};

interface FormFields {
  alias: string;
}

const ProfileForm = ({
  onSubmit,
}: {
  onSubmit: (fields: FormFields) => void;
}) => {
  const t = useT();
  const required = useRequired();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>();

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
        {errors.alias?.message && (
          <InputError>{errors.alias.message}</InputError>
        )}
      </FormGroup>
      <TradingButton type="submit" intent={Intent.Info}>
        {t('Submit')}
      </TradingButton>
    </form>
  );
};
