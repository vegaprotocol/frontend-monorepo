import { DisassociateTransaction } from '../disassociate-transaction';
import { formatNumber } from '../../../../../lib/format-number';
import { remove0x, toBigNum } from '@vegaprotocol/utils';
import { Select } from '@vegaprotocol/ui-toolkit';
import { StakingMethod } from '../../../../../components/staking-method-radio';
import { TokenInput } from '../../../../../components/token-input';
import { TxState } from '../../../../../hooks/transaction-reducer';
import { useRefreshAssociatedBalances } from '../../../../../hooks/use-refresh-associated-balances';
import { useRemoveStake } from '../../hooks';
import type { RemoveStakePayload } from '../../hooks';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { BigNumber } from '../../../../../lib/bignumber';
import { truncateMiddle } from '../../../../../lib/truncate-middle';
import { useBalances } from '../../../../../lib/balances/balances-store';

type Association = {
  /**
   * An unique id of association (combination of staking method and wallet key)
   */
  id: string;
  /**
   * A vega wallet key
   */
  key: string;
  /**
   * Amount of associated tokens
   */
  amount: BigNumber;
  stakingMethod: StakingMethod;
  label: string;
};

const toListOfAssociations = (
  obj: { [vegaKey: string]: BigNumber },
  stakingMethod: StakingMethod
): Association[] =>
  Object.keys(obj)
    .map((k) => ({
      id: `${stakingMethod.toLowerCase()}-${remove0x(k)}`,
      key: remove0x(k),
      amount: obj[k],
      stakingMethod,
      label: '',
    }))
    .filter((k) => k.amount.isGreaterThan(0));

export const DisassociatePage = ({
  address,
  vegaKey,
}: {
  address: string;
  vegaKey: string;
}) => {
  const { t } = useTranslation();

  const { stakingAssociations } = useBalances(
    (state) => state.associationBreakdown
  );

  const associations = useMemo(
    () =>
      [...toListOfAssociations(stakingAssociations, StakingMethod.Wallet)].map(
        (a) => ({
          ...a,
          label: `${truncateMiddle(a.key)} ${t(`via${a.stakingMethod}`)}
                (${formatNumber(a.amount, 18)} ${t('tokens')})`,
        })
      ),
    [stakingAssociations, t]
  );

  useEffect(() => {
    setChosen(associations.find((k) => k.key === vegaKey) || associations[0]);
  }, [associations, vegaKey]);

  const [chosen, setChosen] = useState<Association>();

  const maximum = chosen?.amount || toBigNum(0, 0);
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

  const onChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (!e.target.value) return;
      const chosen = associations.find((a) => a.id === e.target.value);
      if (chosen) {
        setChosen(chosen);
        setAmount('');
      }
    },
    [associations]
  );

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
        'You have no VEGA tokens currently associated through your connected Ethereum wallet.'
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
          onChange={onChange}
          value={chosen?.id}
        >
          {associations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
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
      <p data-testid="disassociation-warning">
        <span className="text-pink">{t('Warning')}:</span>{' '}
        {t(
          'Any tokens that have been nominated to a node will sacrifice rewards they are due for the current epoch. If you do not wish to sacrifice these, you should remove stake from a node at the end of an epoch before disassociation.'
        )}
      </p>

      <h2>{t('What tokens would you like to return?')}</h2>
      {associations.length === 0 ? noKeysMessage : disassociate}
    </section>
  );
};
