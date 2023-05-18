import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { VegaConnectDialog } from '@vegaprotocol/wallet';
import { Connectors } from '../lib/vega-connectors';
import { CreateWithdrawalDialog } from '@vegaprotocol/withdraws';
import { DepositDialog } from '@vegaprotocol/deposits';
import {
  Web3ConnectUncontrolledDialog,
  WithdrawalApprovalDialogContainer,
} from '@vegaprotocol/web3';
import { WelcomeDialog } from '../components/welcome-dialog';
import { TransferDialog } from '@vegaprotocol/accounts';
import { useCallback } from 'react';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/i18n';
import { ExternalLink, Icon } from '@vegaprotocol/ui-toolkit';
import { RISK_ACCEPTED_KEY } from '../components/constants';
import { Links, Routes } from './client-router';

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
        <ExternalLink href={Links[Routes.DISCLAIMER]()} className="underline">
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

const DialogsContainer = () => {
  const { isOpen, id, trigger, setOpen } = useAssetDetailsDialogStore();
  const [riskAcceptedValue, setValue] = useLocalStorage(RISK_ACCEPTED_KEY);
  const onRiskAcknowledge = useCallback(() => {
    setValue('true');
  }, [setValue]);
  return (
    <>
      <VegaConnectDialog
        connectors={Connectors}
        riskMessage={riskAcceptedValue === 'true' ? undefined : <RiskMessage />}
        onRiskAcknowledge={
          riskAcceptedValue === 'true' ? undefined : onRiskAcknowledge
        }
      />
      <AssetDetailsDialog
        assetId={id}
        trigger={trigger || null}
        open={isOpen}
        onChange={setOpen}
      />
      <WelcomeDialog />
      <DepositDialog />
      <Web3ConnectUncontrolledDialog />
      <CreateWithdrawalDialog />
      <TransferDialog />
      <WithdrawalApprovalDialogContainer />
    </>
  );
};

export default DialogsContainer;
