import {
  Button,
  Callout,
  FormGroup,
  Input,
  InputError,
  Intent,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import { EthConnectPrompt } from '../../components/eth-connect-prompt';
import { SplashLoader } from '../../components/splash-loader';
import { useTranches } from '../../lib/tranches/tranches-store';
import RoutesConfig from '../routes';

interface FormFields {
  address: string;
}
type Params = { address: string };

const RedemptionRouter = () => {
  const { address } = useParams<Params>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const validatePubkey = useCallback(
    (value: string) => {
      if (!value.startsWith('0x')) {
        return t('Address must begin with 0x');
      } else if (value.length !== 42) {
        return t('Pubkey must be 42 characters in length');
      } else if (Number.isNaN(+value)) {
        return t('Pubkey must be be valid hex');
      }
      return true;
    },
    [t]
  );
  const { account } = useWeb3React();
  const { tranches, error, loading } = useTranches((state) => ({
    loading: state.loading,
    error: state.error,
    tranches: state.tranches,
  }));
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>();

  const onSubmit = useCallback(
    (fields: FormFields) => {
      navigate(`${RoutesConfig.REDEEM}/${fields.address}`);
    },
    [navigate]
  );

  if (error) {
    return (
      <Callout intent={Intent.Danger} title={t('errorLoadingTranches')}>
        {error.message}
      </Callout>
    );
  }

  if (!tranches || loading) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  if (!address) {
    return (
      <div className="max-w-md">
        {!account ? (
          <EthConnectPrompt />
        ) : (
          <Button
            fill={true}
            variant="primary"
            onClick={() => navigate(`${RoutesConfig.REDEEM}/${account}`)}
            data-testid="view-connected-eth-btn"
          >
            {t('View connected Eth Wallet')}
          </Button>
        )}
        <p className="flex justify-center py-4">{t('OR')}</p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          data-testid="view-connector-form"
        >
          <FormGroup label={'View Ethereum as user:'} labelFor="address">
            <Input
              {...register('address', {
                required: t('Required'),
                validate: validatePubkey,
              })}
              id="address"
              data-testid="address"
              type="text"
            />
            {errors.address?.message && (
              <InputError intent="danger">{errors.address.message}</InputError>
            )}
          </FormGroup>
          <Button data-testid="connect" type="submit" fill={true}>
            {t('View Ethereum user')}
          </Button>
        </form>
      </div>
    );
  }

  return <Outlet />;
};

export default RedemptionRouter;
