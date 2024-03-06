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
import {
  useSimpleTransaction,
  type Status,
  useVegaWallet,
} from '@vegaprotocol/wallet-react';
import {
  usePartyProfilesQuery,
  type PartyProfilesQuery,
} from '../vega-wallet-connect-button/__generated__/PartyProfiles';

export const ProfileDialog = () => {
  const t = useT();
  const { pubKeys } = useVegaWallet();
  const { data, refetch } = usePartyProfilesQuery({
    variables: { partyIds: pubKeys.map((pk) => pk.publicKey) },
    skip: pubKeys.length <= 0,
  });
  const open = useProfileDialogStore((store) => store.open);
  const pubKey = useProfileDialogStore((store) => store.pubKey);
  const setOpen = useProfileDialogStore((store) => store.setOpen);

  const { send, status, error, reset } = useSimpleTransaction({
    onSuccess: () => {
      refetch();
    },
  });

  const profileEdge = data?.partiesProfilesConnection?.edges.find(
    (e) => e.node.partyId === pubKey
  );

  const sendTx = (field: FormFields) => {
    send({
      updatePartyProfile: {
        alias: field.alias,
        metadata: [],
      },
    });
  };

  return (
    <Dialog
      open={open}
      onChange={() => {
        setOpen(undefined);
        reset();
      }}
      title={t('Edit profile')}
    >
      <ProfileForm
        profile={profileEdge?.node}
        status={status}
        error={error}
        onSubmit={sendTx}
      />
    </Dialog>
  );
};

interface FormFields {
  alias: string;
}

type Profile = NonNullable<
  PartyProfilesQuery['partiesProfilesConnection']
>['edges'][number]['node'];

const ProfileForm = ({
  profile,
  onSubmit,
  status,
  error,
}: {
  profile: Profile | undefined;
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
  } = useForm<FormFields>({
    defaultValues: {
      alias: profile?.alias,
    },
  });

  const renderButtonText = () => {
    if (status === 'requested') {
      return t('Confirm in wallet...');
    }

    if (status === 'pending') {
      return t('Confirming transaction...');
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
            <p className="break-words max-w-full first-letter:uppercase">
              {errorMessage}
            </p>
          </InputError>
        )}

        {status === 'confirmed' && (
          <p className="mt-2 mb-4 text-sm text-success">
            {t('Profile updated')}
          </p>
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
