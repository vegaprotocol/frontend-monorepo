import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import type { EthereumConfig } from '@vegaprotocol/web3';
import { useBalances } from '../../../lib/balances/balances-store';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { TxState } from '../../../hooks/transaction-reducer';
import { AssociateTransaction } from './associate-transaction';
import { useAddStake, usePollForStakeLinking } from './hooks';
import { WalletAssociate } from './wallet-associate';

export const AssociatePage = ({
  address,
  vegaKey,
  ethereumConfig,
}: {
  address: string;
  vegaKey: string;
  ethereumConfig: EthereumConfig;
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = React.useState<string>('');

  const {
    state: txState,
    dispatch: txDispatch,
    perform: txPerform,
  } = useAddStake(address, amount, vegaKey, ethereumConfig.confirmations);

  const linking = usePollForStakeLinking(vegaKey, txState.txData.hash);

  const { walletBalance } = useBalances();

  const zeroVega = React.useMemo(
    () => walletBalance.isEqualTo(0),
    [walletBalance]
  );

  if (txState.txState !== TxState.Default) {
    return (
      <AssociateTransaction
        amount={amount}
        vegaKey={vegaKey}
        state={txState}
        dispatch={txDispatch}
        requiredConfirmations={ethereumConfig.confirmations}
        linking={linking}
      />
    );
  }

  return (
    <section data-testid="associate">
      <div className="mb-6">
        <Callout>
          <p data-testid="associate-information1">{t('associateInfo1')}</p>
          <p className="mb-0" data-testid="associate-information2">
            {t('associateInfo2')}
          </p>
        </Callout>
      </div>
      {zeroVega && (
        <Callout intent={Intent.Danger}>
          <p className="mb-0">{t('associateNoVega')}</p>
        </Callout>
      )}

      <WalletAssociate
        address={address}
        vegaKey={vegaKey}
        perform={txPerform}
        amount={amount}
        setAmount={setAmount}
        ethereumConfig={ethereumConfig}
      />
    </section>
  );
};
