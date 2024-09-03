import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import type { EthereumConfig } from '@vegaprotocol/web3';
import { useBalances } from '../../../lib/balances/balances-store';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { StakingMethod } from '../../../components/staking-method-radio';
import { TxState } from '../../../hooks/transaction-reducer';
import { useSearchParams } from '../../../hooks/use-search-params';
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
  const params = useSearchParams();
  const [amount, setAmount] = React.useState<string>('');

  const [selectedStakingMethod, setSelectedStakingMethod] =
    React.useState<StakingMethod | null>(
      (params.method as StakingMethod) || null
    );

  // Clear the amount when the staking method changes
  React.useEffect(() => {
    setAmount('');
  }, [selectedStakingMethod]);

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

  React.useEffect(() => {
    setSelectedStakingMethod(StakingMethod.Wallet);
  }, [params.method, zeroVega]);

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
      {zeroVega ? (
        <Callout intent={Intent.Danger}>
          <p className="mb-0">{t('associateNoVega')}</p>
        </Callout>
      ) : null}
      {selectedStakingMethod && (
        <WalletAssociate
          address={address}
          vegaKey={vegaKey}
          perform={txPerform}
          amount={amount}
          setAmount={setAmount}
          ethereumConfig={ethereumConfig}
        />
      )}
    </section>
  );
};
