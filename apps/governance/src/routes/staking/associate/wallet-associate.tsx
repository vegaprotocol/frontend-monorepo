import React from 'react';
import { useTranslation } from 'react-i18next';

import { TokenInput } from '../../../components/token-input';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { useContracts } from '../../../contexts/contracts/contracts-context';
import { TxState } from '../../../hooks/transaction-reducer';
import { useTransaction } from '../../../hooks/use-transaction';
import { BigNumber } from '../../../lib/bignumber';
import { AssociateInfo } from './associate-info';
import { toBigNum } from '@vegaprotocol/utils';
import type { EthereumConfig } from '@vegaprotocol/web3';
import { useBalances } from '../../../lib/balances/balances-store';
import { MaxUint256 } from '@ethersproject/constants';

export const WalletAssociate = ({
  perform,
  vegaKey,
  amount,
  setAmount,
  address,
  ethereumConfig,
}: {
  perform: () => void;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  vegaKey: string;
  address: string;
  ethereumConfig: EthereumConfig;
}) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();
  const { walletBalance, allowance, walletAssociatedBalance, setAllowance } =
    useBalances();
  const { token } = useContracts();

  const {
    state: approveState,
    perform: approve,
    dispatch: approveDispatch,
  } = useTransaction(() => {
    return token.approve(
      ethereumConfig.staking_bridge_contract.address,
      MaxUint256.toString()
    );
  });

  // Once they have approved deposits then we need to refresh their allowance
  React.useEffect(() => {
    const run = async () => {
      if (approveState.txState === TxState.Complete) {
        const a = await token.allowance(
          address,
          ethereumConfig.staking_bridge_contract.address
        );
        const allowance = toBigNum(a.toString(), decimals);
        setAllowance(allowance);
      }
    };
    run();
  }, [
    address,
    approveState.txState,
    token,
    decimals,
    ethereumConfig,
    setAllowance,
  ]);

  let pageContent = null;

  if (
    walletBalance.isEqualTo('0') &&
    new BigNumber(walletAssociatedBalance || 0).isEqualTo('0')
  ) {
    pageContent = (
      <div className="text-danger">
        {t(
          'You have no VEGA tokens in your connected wallet. You will need to buy some VEGA tokens from an exchange in order to stake using this method.'
        )}
      </div>
    );
  } else if (
    walletBalance.isEqualTo('0') &&
    !new BigNumber(walletAssociatedBalance || 0).isEqualTo('0')
  ) {
    pageContent = (
      <div className="text-danger">
        {t(
          'All VEGA tokens in the connected wallet is already associated with a Vega wallet/key'
        )}
      </div>
    );
  } else {
    pageContent = (
      <>
        <AssociateInfo pubKey={vegaKey} />
        <TokenInput
          approveText={t('Approve VEGA tokens for staking on Vega')}
          submitText={t('Associate VEGA Tokens with key')}
          requireApproval={true}
          allowance={allowance}
          approve={approve}
          perform={perform}
          amount={amount}
          setAmount={setAmount}
          maximum={walletBalance}
          approveTxState={approveState}
          approveTxDispatch={approveDispatch}
          currency={t('VEGA Tokens')}
        />
      </>
    );
  }

  return <section data-testid="wallet-associate">{pageContent}</section>;
};
