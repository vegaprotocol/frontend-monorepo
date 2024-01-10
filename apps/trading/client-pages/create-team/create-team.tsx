import {
  Intent,
  TextArea,
  TradingButton,
  TradingCheckbox,
  TradingFormGroup,
  TradingInput,
  TradingInputError,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { Controller, useForm } from 'react-hook-form';

interface FormFields {
  name: string;
  url: string;
  avatarUrl: string;
  private: boolean;
  allowList: boolean;
}

const urlRegex =
  /^(https?:\/\/)?([a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})+)(:[0-9]{1,5})?(\/[^\s]*)?$/;

export const CreateTeam = () => {
  const t = useT();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormFields>();
  const isPrivate = watch('private');

  return (
    <div className="relative h-full pt-5 overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-[40%] -z-10 bg-[40%_0px] bg-cover bg-no-repeat bg-local bg-[url(/cover.png)]">
        <div className="absolute top-o left-0 w-full h-full bg-gradient-to-t from-white dark:from-vega-cdark-900 to-transparent from-20% to-60%" />
      </div>
      <div className="flex flex-col gap-4 lg:gap-6 container p-4 mx-auto">
        <h1 className="calt text-2xl lg:text-3xl xl:text-5xl">
          {t('Create a team')}
        </h1>
        <form
          className="max-w-screen-xs"
          onSubmit={handleSubmit((formFields) => {
            // eslint-disable-next-line
            console.log(formFields);
          })}
        >
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
                required: t('Required'),
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
                required: t('Required'),

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
                {...register('allowList', { required: t('Required') })}
              />
              {errors.allowList?.message && (
                <TradingInputError forInput="avatarUrl">
                  {errors.allowList.message}
                </TradingInputError>
              )}
            </TradingFormGroup>
          )}
          <p className="text-sm mb-2">
            {t(
              'By creating a team you will generate a referral code which you can share with friends.'
            )}
          </p>
          <p className="text-sm mb-4">
            {t(
              'Anyone joining that referral code will enjoy the benefits of the current referral program, see Referrals for details.'
            )}
          </p>
          <TradingButton type="submit" intent={Intent.Info}>
            {t('Create')}
          </TradingButton>
        </form>
      </div>
    </div>
  );
};
