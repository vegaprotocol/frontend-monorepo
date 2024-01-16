import { useNavigate } from 'react-router-dom';
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
  useVegaWalletDialogStore,
} from '@vegaprotocol/wallet';
import {
  addDecimalsFormatNumber,
  isValidVegaPublicKey,
} from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';
import { useCreateReferralSet } from '../../lib/hooks/use-create-referral-set';
import { DApp, TokenStaticLinks, useLinks } from '@vegaprotocol/environment';
import { RainbowButton } from '../../components/rainbow-button';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { ErrorBoundary } from '../../components/error-boundary';

interface FormFields {
  name: string;
  url: string;
  avatarUrl: string;
  private: boolean;
  allowList: string;
}

const urlRegex =
  /^(https?:\/\/)?([a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})+)(:[0-9]{1,5})?(\/[^\s]*)?$/;

export const CompetitionsCreateTeam = () => {
  const t = useT();
  usePageTitle(t('Create a team'));

  const { isReadOnly, pubKey } = useVegaWallet();
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  return (
    <ErrorBoundary feature="create-team">
      <div className="relative h-full pt-5 overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-[40%] -z-10 bg-[40%_0px] bg-cover bg-no-repeat bg-local bg-[url(/cover.png)]">
          <div className="absolute top-o left-0 w-full h-full bg-gradient-to-t from-white dark:from-vega-cdark-900 to-transparent from-20% to-60%" />
        </div>
        <div className="lg:gap-6 container p-4 mx-auto">
          <div className=" flex flex-col gap-4 bg-vega-clight-800 dark:bg-vega-cdark-800 mx-auto md:w-2/3 max-w-xl rounded-lg p-8">
            <h1 className="calt text-2xl lg:text-3xl xl:text-5xl">
              {t('Create a team')}
            </h1>
            {pubKey && !isReadOnly ? (
              <CreateTeamFormContainer />
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
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const CreateTeamFormContainer = () => {
  const t = useT();
  const createLink = useLinks(DApp.Governance);
  const navigate = useNavigate();

  const { err, status, isEligible, requiredStake, onSubmit } =
    useCreateReferralSet({
      onSuccess: (code) => navigate(Links.COMPETITIONS_CREATE_TEAM(code)),
    });

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

  return <CreateTeamForm onSubmit={onSubmit} status={status} err={err} />;
};

const CreateTeamForm = ({
  status,
  err,
  onSubmit,
}: {
  status: ReturnType<typeof useCreateReferralSet>['status'];
  err: ReturnType<typeof useCreateReferralSet>['err'];
  onSubmit: (tx: CreateReferralSet) => void;
}) => {
  const t = useT();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormFields>();

  const isPrivate = watch('private');

  const createTeam = (fields: FormFields) => {
    const publicKeys = parseAllowListText(fields.allowList);
    onSubmit({
      createReferralSet: {
        isTeam: true,
        team: {
          name: fields.name,
          teamUrl: fields.url,
          avatarUrl: fields.avatarUrl,
          closed: fields.private,
          allowList: publicKeys,
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
            pattern: { value: urlRegex, message: t('Invalid URL') },
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
              value: urlRegex,
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
      <TradingButton
        type="submit"
        intent={Intent.Info}
        disabled={status === 'loading'}
      >
        {t('Create')}
      </TradingButton>
    </form>
  );
};

const parseAllowListText = (str: string) => {
  return str
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};
