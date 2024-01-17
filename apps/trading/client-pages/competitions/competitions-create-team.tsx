import { useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import {
  Intent,
  TextArea,
  TradingAnchorButton,
  TradingButton,
  TradingCheckbox,
  TradingFormGroup,
  TradingInput,
  TradingInputError,
} from '@vegaprotocol/ui-toolkit';
import {
  useVegaWallet,
  type CreateReferralSet,
  type Status,
  useVegaWalletDialogStore,
} from '@vegaprotocol/wallet';
import {
  addDecimalsFormatNumber,
  isValidVegaPublicKey,
  URL_REGEX,
} from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { useCreateReferralSet } from '../../lib/hooks/use-create-referral-set';
import { DApp, TokenStaticLinks, useLinks } from '@vegaprotocol/environment';
import { RainbowButton } from '../../components/rainbow-button';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { ErrorBoundary } from '../../components/error-boundary';
import { Box } from '../../components/competitions/box';
import { LayoutWithGradient } from '../../components/layouts-inner';
import { Links } from '../../lib/links';

interface FormFields {
  name: string;
  url: string;
  avatarUrl: string;
  private: boolean;
  allowList: string;
}

export const CompetitionsCreateTeam = () => {
  const [searchParams] = useSearchParams();
  const isSolo = Boolean(searchParams.get('solo'));
  const t = useT();
  usePageTitle(t('Create a team'));

  const { isReadOnly, pubKey } = useVegaWallet();
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  return (
    <ErrorBoundary feature="create-team">
      <LayoutWithGradient>
        <div className="mx-auto md:w-2/3 max-w-xl">
          <Box className="flex flex-col gap-4">
            <h1 className="calt text-2xl lg:text-3xl xl:text-5xl">
              {t('Create a team')}
            </h1>
            {pubKey && !isReadOnly ? (
              <CreateTeamFormContainer isSolo={isSolo} />
            ) : (
              <>
                <p>
                  {t(
                    'Create a team to participate in team based rewards as well as access the discount benefits of the current referral program.'
                  )}
                </p>
                <RainbowButton variant="border" onClick={openWalletDialog}>
                  {t('Connect wallet')}
                </RainbowButton>
              </>
            )}
          </Box>
        </div>
      </LayoutWithGradient>
    </ErrorBoundary>
  );
};

const CreateTeamFormContainer = ({ isSolo }: { isSolo: boolean }) => {
  const t = useT();
  const createLink = useLinks(DApp.Governance);

  const { err, status, code, isEligible, requiredStake, onSubmit } =
    useCreateReferralSet({
      onSuccess: (code) => {
        // For some reason team creation takes a long time, too long even to make
        // polling viable, so its not feasible to navigate to the team page
        // after creation
        //
        // navigate(Links.COMPETITIONS_TEAM(code));
      },
    });

  if (status === 'confirmed') {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm">{t('Team creation transaction successful')}</p>
        {code && (
          <>
            <p className="text-sm">
              Your team ID is:{' '}
              <span className="font-mono break-all">{code}</span>
            </p>
            <TradingAnchorButton
              href={Links.COMPETITIONS_TEAM(code)}
              intent={Intent.Info}
              size="small"
            >
              {t('View team')}
            </TradingAnchorButton>
          </>
        )}
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="flex flex-col gap-4">
        {requiredStake !== undefined && (
          <p>
            {t(
              'You need at least {{requiredStake}} VEGA staked to generate a referral code and participate in the referral program.',
              {
                requiredStake: addDecimalsFormatNumber(
                  requiredStake.toString(),
                  18
                ),
              }
            )}
          </p>
        )}
        <TradingAnchorButton
          href={createLink(TokenStaticLinks.ASSOCIATE)}
          intent={Intent.Primary}
          target="_blank"
        >
          {t('Stake some $VEGA now')}
        </TradingAnchorButton>
      </div>
    );
  }

  return (
    <CreateTeamForm
      onSubmit={onSubmit}
      status={status}
      err={err}
      isSolo={isSolo}
    />
  );
};

const CreateTeamForm = ({
  status,
  err,
  isSolo,
  onSubmit,
}: {
  status: ReturnType<typeof useCreateReferralSet>['status'];
  err: ReturnType<typeof useCreateReferralSet>['err'];
  isSolo: boolean;
  onSubmit: (tx: CreateReferralSet) => void;
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
    },
  });

  const isPrivate = watch('private');

  const createTeam = (fields: FormFields) => {
    onSubmit({
      createReferralSet: {
        isTeam: true,
        team: {
          name: fields.name,
          teamUrl: fields.url,
          avatarUrl: fields.avatarUrl,
          closed: fields.private,
          allowList: fields.private ? parseAllowListText(fields.allowList) : [],
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(createTeam)}>
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
      <SubmitButton status={status} />
    </form>
  );
};

const SubmitButton = ({ status }: { status: Status }) => {
  const t = useT();
  const disabled = status === 'pending' || status === 'requested';

  let text = t('Create');

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
