import { useCallback } from 'react';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { VegaConnectDialog, VegaManageDialog } from '@vegaprotocol/wallet';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { Connectors } from '../../lib/vega-connectors';
import { t } from '@vegaprotocol/i18n';
import { ExternalLink, Icon } from '@vegaprotocol/ui-toolkit';
import Routes from '../../routes/routes';

export const RISK_ACCEPTED_KEY = 'vega_risk_accepted';

const RiskMessage = () => {
  return (
    <>
      <div className="bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 p-6 mb-6">
        <ul className="list-disc ml-6 text-lg">
          <li>
            {t(
              'No party hosts or operates this IFPS website or offers any financial advice.'
            )}
          </li>
          <li>
            {t(
              'You may encounter bugs, loss of functionality or loss of assets.'
            )}
          </li>
          <li>
            {t('No party accepts any liability for any losses whatsoever.')}
          </li>
        </ul>
      </div>
      <p className="mb-8">
        {t(
          'By using the Vega Console, you acknowledge that you have read and understood the'
        )}{' '}
        <ExternalLink href={Routes.DISCLAIMER} className="underline">
          <span className="flex items-center gap-2">
            <span>{t('Vega Console Disclaimer')}</span>
            <Icon name="arrow-top-right" size={3} />
          </span>
        </ExternalLink>
        .
      </p>
    </>
  );
};

export const VegaWalletDialogs = () => {
  const { appState, appDispatch } = useAppState();

  const [riskAcceptedValue, setValue] = useLocalStorage(RISK_ACCEPTED_KEY);
  const onRiskAcknowledge = useCallback(() => {
    setValue('true');
  }, [setValue]);

  return (
    <>
      <VegaConnectDialog
        connectors={Connectors}
        onChangeOpen={(open) =>
          appDispatch({
            type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
            isOpen: open,
          })
        }
        riskMessage={riskAcceptedValue === 'true' ? undefined : <RiskMessage />}
        onRiskAcknowledge={
          riskAcceptedValue === 'true' ? undefined : onRiskAcknowledge
        }
      />

      <VegaManageDialog
        dialogOpen={appState.vegaWalletManageOverlay}
        setDialogOpen={(open) =>
          appDispatch({
            type: AppStateActionType.SET_VEGA_WALLET_MANAGE_OVERLAY,
            isOpen: open,
          })
        }
      />
    </>
  );
};
