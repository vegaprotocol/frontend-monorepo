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
import { useCallback, useEffect, useReducer, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { EthConnectPrompt } from '../../components/eth-connect-prompt';
import { SplashLoader } from '../../components/splash-loader';
import { useTranches } from '../../hooks/use-tranches';
import { useBalances } from '../../lib/balances/balances-store';
import RoutesConfig from '../routes';
import {
  initialRedemptionState,
  RedemptionActionType,
  redemptionReducer,
} from './redemption-reducer';

interface FormFields {
  address: string;
}

const RedemptionRouter = () => {
  const { t } = useTranslation();
  const validatePubkey = useCallback(
    (value: string) => {
      console.log(value.length);
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
  const [state, dispatch] = useReducer(
    redemptionReducer,
    initialRedemptionState
  );
  const { trancheBalances } = useBalances();
  const { account } = useWeb3React();
  const [address, setAddress] = useState<string | null | undefined>(account);
  const { tranches, error, loading } = useTranches();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>();

  useEffect(() => {
    if (address) {
      const userTranches = tranches?.filter((t) =>
        t.users.some(
          ({ address: a }) => a.toLowerCase() === address.toLowerCase()
        )
      );
      console.log(userTranches);

      if (userTranches) {
        dispatch({
          type: RedemptionActionType.SET_USER_TRANCHES,
          userTranches,
        });
      }
    }
  }, [address, tranches]);

  const onSubmit = useCallback((fields: FormFields) => {
    setAddress(fields.address);
  }, []);

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
      <div>
        <EthConnectPrompt>
          <p data-testid="eth-connect-prompt">
            {t(
              "Use the Ethereum wallet you want to send your tokens to. You'll also need enough Ethereum to pay gas."
            )}
          </p>
        </EthConnectPrompt>
        <p className="py-4">{t('OR')}</p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          data-testid="view-connector-form"
        >
          <FormGroup label={t('View Ethereum user:')} labelFor="address">
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

  if (!trancheBalances.length) {
    return (
      <>
        <Callout>
          <p>{t('You have no VEGA tokens currently vesting.')}</p>
        </Callout>
        <Link to={RoutesConfig.SUPPLY}>{t('viewAllTranches')}</Link>
      </>
    );
  }

  return <Outlet context={{ state, account: address }} />;
};

export default RedemptionRouter;
