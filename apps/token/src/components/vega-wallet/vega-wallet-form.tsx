import { FormGroup, Intent, Switch } from "@blueprintjs/core";
import * as Sentry from "@sentry/react";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Flags } from "../../config";
import {
  AppStateActionType,
  useAppState,
} from "../../contexts/app-state/app-state-context";
import { useRefreshAssociatedBalances } from "../../hooks/use-refresh-associated-balances";
import {
  HOSTED_WALLET_URL,
  vegaWalletService,
} from "../../lib/vega-wallet/vega-wallet-service";

interface FormFields {
  url: string;
  wallet: string;
  passphrase: string;
}

interface VegaWalletFormProps {
  onConnect: () => void;
  url: string;
  setUrl: (url: string) => void;
}

export const VegaWalletForm = ({
  onConnect,
  url,
  setUrl,
}: VegaWalletFormProps) => {
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { appDispatch } = useAppState();
  const refreshAssociatedBalances = useRefreshAssociatedBalances();

  const [loading, setLoading] = React.useState(false);
  const [hostedWallet, setHostedWallet] = React.useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<FormFields>({
    defaultValues: {
      url,
    },
  });

  const formUrl = useWatch({ name: "url", control });

  React.useEffect(() => {
    setUrl(formUrl);
  }, [formUrl, setUrl]);

  async function onSubmit(fields: FormFields) {
    setLoading(true);

    try {
      const [tokenErr] = await vegaWalletService.getToken({
        wallet: fields.wallet,
        passphrase: fields.passphrase,
        url: fields.url,
      });

      if (tokenErr) {
        setError("passphrase", { message: t(tokenErr) });
        setLoading(false);
        return;
      }

      const [keysErr, keys] = await vegaWalletService.getKeys();

      if (keysErr) {
        setError("passphrase", { message: t(keysErr) });
        setLoading(false);
        return;
      }

      let key = undefined;
      if (account && keys && keys.length) {
        key = vegaWalletService.key || keys[0].pub;
        await refreshAssociatedBalances(account, key);
      }

      appDispatch({
        type: AppStateActionType.VEGA_WALLET_INIT,
        keys,
        key,
      });

      setLoading(false);
      onConnect();
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  const required = t("required");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="vega-wallet-form">
      {Flags.HOSTED_WALLET_ENABLED ? (
        <FormGroup labelFor="hostedWallet" label={t("hostedSwitchLabel")}>
          <Switch
            large={true}
            name="hostedWallet"
            checked={hostedWallet}
            onChange={(a) => {
              const input = a.target as HTMLInputElement;
              setHostedWallet(input.checked);
              setValue(
                "url",
                input.checked ? HOSTED_WALLET_URL : vegaWalletService.url,
                {
                  shouldValidate: false,
                }
              );
            }}
          />
        </FormGroup>
      ) : null}
      <FormGroup
        label={t("walletServiceLabel")}
        labelFor="url"
        intent={errors.url?.message ? Intent.DANGER : Intent.NONE}
        helperText={errors.url?.message}
      >
        <input
          disabled={hostedWallet}
          {...register("url", { required })}
          type="text"
          className="bp3-input"
        />
      </FormGroup>
      <FormGroup
        label={t("walletLabel")}
        labelFor="wallet"
        intent={errors.wallet?.message ? Intent.DANGER : Intent.NONE}
        helperText={errors.wallet?.message}
      >
        <input
          data-testid="wallet-name"
          {...register("wallet", { required })}
          type="text"
          className="bp3-input"
        />
      </FormGroup>
      <FormGroup
        label={t("passphraseLabel")}
        labelFor="passphrase"
        intent={errors.passphrase?.message ? Intent.DANGER : Intent.NONE}
        helperText={errors.passphrase?.message}
      >
        <input
          data-testid="wallet-password"
          {...register("passphrase", { required })}
          type="password"
          className="bp3-input"
        />
      </FormGroup>
      <button
        data-testid="wallet-login"
        type="submit"
        disabled={loading}
        className="fill"
      >
        {loading ? t("vegaWalletConnecting") : t("vegaWalletConnect")}
      </button>
    </form>
  );
};
