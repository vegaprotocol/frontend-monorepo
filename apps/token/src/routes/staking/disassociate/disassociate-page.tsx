import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConnectedVegaKey } from '../../../components/connected-vega-key';
import {
  StakingMethod,
  StakingMethodRadio,
} from '../../../components/staking-method-radio';
import { TxState } from '../../../hooks/transaction-reducer';
import { useSearchParams } from '../../../hooks/use-search-params';
import { useRefreshAssociatedBalances } from '../../../hooks/use-refresh-associated-balances';
import { ContractDisassociate } from './contract-disassociate';
import { DisassociateTransaction } from './disassociate-transaction';
import { useRemoveStake } from './hooks';
import { WalletDisassociate } from './wallet-disassociate';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';

export const DisassociatePage = ({
  address,
  vegaKey,
}: {
  address: string;
  vegaKey: VegaKeyExtended;
}) => {
  const { t } = useTranslation();
  const params = useSearchParams();
  const [amount, setAmount] = React.useState<string>('');
  const [selectedStakingMethod, setSelectedStakingMethod] =
    React.useState<StakingMethod | null>(params.method || null);
  const refreshBalances = useRefreshAssociatedBalances();

  // Clear the amount when the staking method changes
  React.useEffect(() => {
    setAmount('');
  }, [selectedStakingMethod]);

  const {
    state: txState,
    dispatch: txDispatch,
    perform: txPerform,
  } = useRemoveStake(address, amount, vegaKey.pub, selectedStakingMethod);

  React.useEffect(() => {
    if (txState.txState === TxState.Complete) {
      refreshBalances(address, vegaKey.pub);
    }
  }, [txState, refreshBalances, address, vegaKey.pub]);

  if (txState.txState !== TxState.Default) {
    return (
      <DisassociateTransaction
        state={txState}
        amount={amount}
        vegaKey={vegaKey.pub}
        stakingMethod={selectedStakingMethod as StakingMethod}
        dispatch={txDispatch}
      />
    );
  }

  return (
    <section className="disassociate-page" data-testid="disassociate-page">
      <p className="mb-12">
        {t(
          'Use this form to disassociate VEGA tokens with a Vega key. This returns them to either the Ethereum wallet that used the Staking bridge or the vesting contract.'
        )}
      </p>
      <p className="mb-12">
        <span className="text-vega-red">{t('Warning')}:</span>{' '}
        {t(
          'Any Tokens that have been nominated to a node will sacrifice any Rewards they are due for the current epoch. If you do not wish to sacrifices fees you should remove stake from a node at the end of an epoch before disassocation.'
        )}
      </p>
      <h2 className="text-h4 text-white mb-8">
        {t('What Vega wallet are you removing Tokens from?')}
      </h2>
      <ConnectedVegaKey pubKey={vegaKey.pub} />
      <h2 className="text-h4 text-white mb-8">
        {t('What tokens would you like to return?')}
      </h2>
      <StakingMethodRadio
        setSelectedStakingMethod={setSelectedStakingMethod}
        selectedStakingMethod={selectedStakingMethod}
      />
      {selectedStakingMethod &&
        (selectedStakingMethod === StakingMethod.Wallet ? (
          <WalletDisassociate
            setAmount={setAmount}
            amount={amount}
            perform={txPerform}
          />
        ) : (
          <ContractDisassociate
            setAmount={setAmount}
            amount={amount}
            perform={txPerform}
          />
        ))}
    </section>
  );
};
