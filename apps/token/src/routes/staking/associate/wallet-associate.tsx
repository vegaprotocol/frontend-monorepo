import React from 'react';
import { useTranslation } from 'react-i18next';

import { TokenInput } from '../../../components/token-input';
import {
  AppStateActionType,
  useAppState,
} from '../../../contexts/app-state/app-state-context';
import { useContracts } from '../../../contexts/contracts/contracts-context';
import { TxState } from '../../../hooks/transaction-reducer';
import { useTransaction } from '../../../hooks/use-transaction';
import { BigNumber } from '../../../lib/bignumber';
import { AssociateInfo } from './associate-info';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import { toBigNum } from '@vegaprotocol/react-helpers';
import type { EthereumConfig } from '@vegaprotocol/web3';

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
  vegaKey: VegaKeyExtended;
  address: string;
  ethereumConfig: EthereumConfig;
}) => {
  const { t } = useTranslation();
  const {
    appDispatch,
    appState: { walletBalance, allowance, walletAssociatedBalance, decimals },
  } = useAppState();

  const { token } = useContracts();

  const {
    state: approveState,
    perform: approve,
    dispatch: approveDispatch,
  } = useTransaction(() =>
    token.approve(
      ethereumConfig.staking_bridge_contract.address,
      Number.MAX_SAFE_INTEGER.toString()
    )
  );

  // Once they have approved deposits then we need to refresh their allowance
  React.useEffect(() => {
    const run = async () => {
      if (approveState.txState === TxState.Complete) {
        const a = await token.allowance(
          address,
          ethereumConfig.staking_bridge_contract.address
        );
        const allowance = toBigNum(a, decimals);
        appDispatch({
          type: AppStateActionType.SET_ALLOWANCE,
          allowance,
        });
      }
    };
    run();
  }, [
    address,
    appDispatch,
    approveState.txState,
    token,
    decimals,
    ethereumConfig,
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
        <AssociateInfo pubKey={vegaKey.pub} />
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
