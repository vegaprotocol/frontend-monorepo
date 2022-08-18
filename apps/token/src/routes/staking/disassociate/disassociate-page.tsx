import { DisassociateTransaction } from './disassociate-transaction';
import { formatNumber } from '../../../lib/format-number';
import { remove0x, toBigNum } from '@vegaprotocol/react-helpers';
import { Select } from '@vegaprotocol/ui-toolkit';
import { StakingMethod } from '../../../components/staking-method-radio';
import { TokenInput } from '../../../components/token-input';
import { TxState } from '../../../hooks/transaction-reducer';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { useRefreshAssociatedBalances } from '../../../hooks/use-refresh-associated-balances';
import { useRemoveStake } from './hooks';
import type { RemoveStakePayload } from './hooks';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { BigNumber } from '../../../lib/bignumber';

type Association = {
  key: string;
  value: BigNumber;
  stakingMethod: StakingMethod;
};

const toListOfAssociations = (
  obj: { [vegaKey: string]: BigNumber },
  stakingMethod: StakingMethod
): Association[] =>
  Object.keys(obj)
    .map((k) => ({
      key: remove0x(k),
      value: obj[k],
      stakingMethod,
    }))
    .filter((k) => k.value.isGreaterThan(0));

export const DisassociatePage = ({
  address,
  vegaKey,
}: {
  address: string;
  vegaKey: string;
}) => {
  const { t } = useTranslation();

  const {
    appState: {
      associationBreakdown: { stakingAssociations, vestingAssociations },
    },
  } = useAppState();

  const associations = useMemo(
    () => [
      ...toListOfAssociations(stakingAssociations, StakingMethod.Wallet),
      ...toListOfAssociations(vestingAssociations, StakingMethod.Contract),
    ],
    [stakingAssociations, vestingAssociations]
  );

  useEffect(() => {
    setChosen(associations.find((k) => k.key === vegaKey) || associations[0]);
  }, [associations, vegaKey]);

  const [chosen, setChosen] = useState<Association>();

  const maximum = chosen?.value || toBigNum(0, 0);
  const [amount, setAmount] = useState<string>('');

  const refreshBalances = useRefreshAssociatedBalances();

  const payload: RemoveStakePayload = {
    amount,
    vegaKey: chosen?.key || '',
    stakingMethod: chosen?.stakingMethod || StakingMethod.Unknown,
  };

  const {
    state: txState,
    dispatch: txDispatch,
    perform: txPerform,
  } = useRemoveStake(address, payload);

  useEffect(() => {
    if (txState.txState === TxState.Complete) {
      refreshBalances(address, chosen?.key || '');
    }
  }, [txState, refreshBalances, address, chosen]);

  if (txState.txState !== TxState.Default && payload) {
    return (
      <DisassociateTransaction
        state={txState}
        amount={amount}
        vegaKey={chosen?.key || ''}
        stakingMethod={payload.stakingMethod}
        dispatch={txDispatch}
      />
    );
  }

  const noKeysMessage = (
    <div className="disassociate-page__error">
      {t(
        'You have no VEGA tokens currently staked through your connected Eth wallet.'
      )}
    </div>
  );

  const disassociate = (
    <>
      <div className="pb-8">
        <Select
          className="font-mono"
          disabled={associations.length === 1}
          id="vega-key-selector"
          onChange={(e) => {
            if (!e.target.value) return;
            const chosen = associations.find((k) => k.key === e.target.value);
            if (chosen) {
              setChosen(chosen);
              setAmount('');
            }
          }}
          value={chosen?.key}
        >
          {associations.map((k) => (
            <option
              key={k.key}
              value={k.key}
              title={`${t(k.stakingMethod)}: ${formatNumber(k.value, 18)}`}
            >
              {k.key}
            </option>
          ))}
        </Select>
      </div>
      <TokenInput
        submitText={t('Disassociate VEGA Tokens from key')}
        perform={txPerform}
        maximum={maximum}
        amount={amount}
        setAmount={setAmount}
        currency={t('VEGA Tokens')}
      />
    </>
  );

  return (
    <section className="disassociate-page" data-testid="disassociate-page">
      <p>
        {t(
          'Use this form to disassociate VEGA tokens with a Vega key. This returns them to either the Ethereum wallet that used the Staking bridge or the vesting contract.'
        )}
      </p>
      <p>
        <span className="text-vega-red">{t('Warning')}:</span>{' '}
        {t(
          'Any Tokens that have been nominated to a node will sacrifice any Rewards they are due for the current epoch. If you do not wish to sacrifices fees you should remove stake from a node at the end of an epoch before disassocation.'
        )}
      </p>

      <h2>{t('What tokens would you like to return?')}</h2>
      {associations.length === 0 ? noKeysMessage : disassociate}
    </section>
  );
};
