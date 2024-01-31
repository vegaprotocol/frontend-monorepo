import {
  TradingFormGroup,
  TradingInput,
  TradingInputError,
  TradingCheckbox,
  TextArea,
  TradingButton,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import { URL_REGEX, isValidVegaPublicKey } from '@vegaprotocol/utils';

import { type useReferralSetTransaction } from '../../lib/hooks/use-referral-set-transaction';
import { useT } from '../../lib/use-t';
import { useForm, Controller } from 'react-hook-form';
import type {
  CreateReferralSet,
  UpdateReferralSet,
  Status,
} from '@vegaprotocol/wallet';

export type FormFields = {
  id: string;
  name: string;
  url: string;
  avatarUrl: string;
  private: boolean;
  allowList: string;
};

export enum TransactionType {
  CreateReferralSet,
  UpdateReferralSet,
}

const prepareTransaction = (
  type: TransactionType,
  fields: FormFields
): CreateReferralSet | UpdateReferralSet => {
  switch (type) {
    case TransactionType.CreateReferralSet:
      return {
        createReferralSet: {
          isTeam: true,
          team: {
            name: fields.name,
            teamUrl: fields.url,
            avatarUrl: fields.avatarUrl,
            closed: fields.private,
            allowList: fields.private
              ? parseAllowListText(fields.allowList)
              : [],
          },
        },
      };
    case TransactionType.UpdateReferralSet:
      return {
        updateReferralSet: {
          id: fields.id,
          isTeam: true,
          team: {
            name: fields.name,
            teamUrl: fields.url,
            avatarUrl: fields.avatarUrl,
            closed: fields.private,
            allowList: fields.private
              ? parseAllowListText(fields.allowList)
              : [],
          },
        },
      };
  }
};

export const TeamForm = ({
  type,
  status,
  err,
  isSolo,
  onSubmit,
  defaultValues,
}: {
  type: TransactionType;
  status: ReturnType<typeof useReferralSetTransaction>['status'];
  err: ReturnType<typeof useReferralSetTransaction>['err'];
  isSolo: boolean;
  onSubmit: ReturnType<typeof useReferralSetTransaction>['onSubmit'];
  defaultValues?: FormFields;
}) => {
  const t = useT();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      private: isSolo,
      ...defaultValues,
    },
  });

  const isPrivate = watch('private');

  const sendTransaction = (fields: FormFields) => {
    onSubmit(prepareTransaction(type, fields));
  };

  return (
    <form onSubmit={handleSubmit(sendTransaction)}>
      <input
        type="hidden"
        {...register('id', {
          disabled: true,
        })}
      />
      <TradingFormGroup label={t('Team name')} labelFor="name">
        <TradingInput {...register('name', { required: t('Required') })} />
        {errors.name?.message && (
          <TradingInputError forInput="name">
            {errors.name.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      <TradingFormGroup
        label={t('URL')}
        labelFor="url"
        labelDescription={t(
          'Provide a link so users can learn more about your team'
        )}
      >
        <TradingInput
          {...register('url', {
            pattern: { value: URL_REGEX, message: t('Invalid URL') },
          })}
        />
        {errors.url?.message && (
          <TradingInputError forInput="url">
            {errors.url.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      <TradingFormGroup
        label={t('Avatar URL')}
        labelFor="avatarUrl"
        labelDescription={t('Provide a URL to a hosted image')}
      >
        <TradingInput
          {...register('avatarUrl', {
            pattern: {
              value: URL_REGEX,
              message: t('Invalid image URL'),
            },
          })}
        />
        {errors.avatarUrl?.message && (
          <TradingInputError forInput="avatarUrl">
            {errors.avatarUrl.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      <TradingFormGroup
        label={t('Make team private')}
        labelFor="private"
        hideLabel={true}
      >
        <Controller
          name="private"
          control={control}
          render={({ field }) => {
            return (
              <TradingCheckbox
                label={t('Make team private')}
                checked={field.value}
                onCheckedChange={(value) => {
                  field.onChange(value);
                }}
                disabled={isSolo}
              />
            );
          }}
        />
      </TradingFormGroup>
      {isPrivate && (
        <TradingFormGroup
          label={t('Public key allow list')}
          labelFor="allowList"
          labelDescription={t(
            'Use a comma separated list to allow only specific public keys to join the team'
          )}
        >
          <TextArea
            {...register('allowList', {
              required: t('Required'),
              disabled: isSolo,
              validate: {
                allowList: (value) => {
                  const publicKeys = parseAllowListText(value);
                  if (publicKeys.every((pk) => isValidVegaPublicKey(pk))) {
                    return true;
                  }
                  return t('Invalid public key found in allow list');
                },
              },
            })}
          />
          {errors.allowList?.message && (
            <TradingInputError forInput="avatarUrl">
              {errors.allowList.message}
            </TradingInputError>
          )}
        </TradingFormGroup>
      )}
      {err && <p className="text-danger text-xs mb-4 capitalize">{err}</p>}
      <SubmitButton type={type} status={status} />
    </form>
  );
};

const SubmitButton = ({
  type,
  status,
}: {
  type?: TransactionType;
  status: Status;
}) => {
  const t = useT();
  const disabled = status === 'pending' || status === 'requested';

  let text = t('Create');
  if (type === TransactionType.UpdateReferralSet) {
    text = t('Update');
  }

  if (status === 'requested') {
    text = t('Confirm in wallet...');
  } else if (status === 'pending') {
    text = t('Confirming transaction...');
  }

  return (
    <TradingButton type="submit" intent={Intent.Info} disabled={disabled}>
      {text}
    </TradingButton>
  );
};

const parseAllowListText = (str: string) => {
  return str
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};
