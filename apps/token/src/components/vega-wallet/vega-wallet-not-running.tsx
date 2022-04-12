import './vega-wallet-not-running.scss';

import { useTranslation } from 'react-i18next';

import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';

interface VegaWalletNotRunningProps {
  url: string;
  setUrl: (url: string) => void;
}

// TODO TFE import do we need this?
export const VegaWalletNotRunning = ({
  url,
  setUrl,
}: VegaWalletNotRunningProps) => {
  const { t } = useTranslation();

  return (
    <div className="vega-wallet-not-running__container">
      <div className="vega-wallet-not-running__input">
        <FormGroup
          label={t('walletServiceLabel')}
          labelFor="wallet-service-url"
        >
          <Input
            name="wallet-service-url"
            id="wallet-service-url"
            type="text"
            className="bp3-input"
            onChange={(e) => setUrl(e.target.value)}
            value={url}
          />
        </FormGroup>
      </div>
      <div className="vega-wallet-not-running__text-container">
        <div className="vega-wallet-not-running__exclamation">!</div>
        <div className="vega-wallet-not-running__text">
          <p>{t('noWalletDetected')}</p>
          <p>{t('noWalletHelpText')}</p>
        </div>
      </div>
    </div>
  );
};
