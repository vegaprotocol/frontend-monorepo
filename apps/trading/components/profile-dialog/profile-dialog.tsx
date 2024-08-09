import {
  TradingDialog,
  FormGroup,
  Input,
  InputError,
  Intent,
  Button,
} from '@vegaprotocol/ui-toolkit';
import { useProfileDialogStore } from '../../stores/profile-dialog-store';
import { useForm } from 'react-hook-form';
import { useT } from '../../lib/use-t';
import { useRequired } from '@vegaprotocol/utils';
import {
  useSimpleTransaction,
  useVegaWallet,
  TxStatus,
} from '@vegaprotocol/wallet-react';
import {
  usePartyProfilesQuery,
  type PartyProfilesQuery,
} from '../vega-wallet-connect-button/__generated__/PartyProfiles';
import { TransactionSteps } from '../transaction-dialog/transaction-steps';

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

  const profileEdge = data?.partiesProfilesConnection?.edges.find(
    (e) => e.node.partyId === pubKey
  );

  return (
    <TradingDialog
      open={open}
      onOpenChange={() => {
        setOpen(undefined);
      }}
      title={t('Edit profile')}
    >
      <ProfileFormContainer
        profile={profileEdge?.node}
        onSuccess={() => {
          refetch();
        }}
      />
    </TradingDialog>
  );
};

interface FormFields {
  alias: string;
}

type Profile = NonNullable<
  PartyProfilesQuery['partiesProfilesConnection']
>['edges'][number]['node'];

const ProfileFormContainer = ({
  profile,
  onSuccess,
}: {
  profile: Profile | undefined;
  onSuccess: () => void;
}) => {
  const t = useT();
  const { send, result, status, error, reset } = useSimpleTransaction({
    onSuccess,
  });
  const sendTx = (field: FormFields) => {
    send({
      updatePartyProfile: {
        alias: field.alias,
        metadata: [],
      },
    });
  };

  if (status !== TxStatus.Idle) {
    return (
      <TransactionSteps
        status={status}
        result={result}
        error={error}
        reset={reset}
        confirmedLabel={t('Profile updated')}
      />
    );
  }

  return <ProfileForm profile={profile} error={error} onSubmit={sendTx} />;
};

const ProfileForm = ({
  profile,
  onSubmit,
  error,
}: {
  profile: Profile | undefined;
  onSubmit: (fields: FormFields) => void;
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
      </FormGroup>
      <Button type="submit" intent={Intent.Info}>
        {t('Submit')}
      </Button>
    </form>
  );
};
