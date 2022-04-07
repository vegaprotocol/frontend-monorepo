import './token-input.scss';

import {
  FormGroup,
  InputGroup,
  Tag,
  Intent as BlueprintIntent,
} from '@blueprintjs/core';
import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type {
  TransactionAction,
  TransactionState,
} from '../../hooks/transaction-reducer';
import {
  TransactionActionType,
  TxState,
} from '../../hooks/transaction-reducer';
import { BigNumber } from '../../lib/bignumber';
import { Tick } from '../icons';
import { TransactionCallout } from '../transaction-callout';

const inputName = 'amount';

export const AmountInput = ({
  amount,
  setAmount,
  maximum,
  currency,
}: {
  amount: string;
  setAmount: React.Dispatch<any>;
  maximum: BigNumber;
  currency: string;
}) => {
  const { t } = useTranslation();
  return (
    <div className="token-input__container">
      <InputGroup
        data-testid="token-amount-input"
        className="token-input__input"
        name={inputName}
        id={inputName}
        onChange={(e) => setAmount(e.target.value)}
        value={amount}
        intent={BlueprintIntent.NONE}
        rightElement={<Tag minimal={true}>{currency}</Tag>}
        autoComplete="off"
        type="number"
        max={maximum.toString()}
        min={0}
        step="any"
      />
      {maximum && (
        <button
          type="button"
          onClick={() => setAmount(maximum.toString())}
          data-testid="token-amount-use-maximum"
          className="button-link token-input__use-maximum "
        >
          {t('Use maximum')}
        </button>
      )}
    </div>
  );
};

export const TokenInput = ({
  amount,
  setAmount,
  perform,
  submitText,
  currency,

  approveText,
  allowance,
  approve,
  requireApproval = false,
  maximum = new BigNumber('0'),
  minimum = new BigNumber('0'),
  approveTxState,
  approveTxDispatch,
}: {
  amount: string;
  setAmount: React.Dispatch<any>;
  perform: () => void;
  submitText: string;
  currency: string;

  requireApproval?: boolean;
  maximum?: BigNumber;
  minimum?: BigNumber;
  allowance?: BigNumber;
  approve?: () => void;
  approveText?: string;
  approveTxState?: TransactionState;
  approveTxDispatch?: React.Dispatch<TransactionAction>;
}) => {
  if (
    requireApproval &&
    (allowance == null ||
      approve == null ||
      !approveTxState ||
      !approveTxDispatch)
  ) {
    throw new Error(
      'If requires approval is true allowance, approve, approveTxState and approveDispatch props are required!'
    );
  }
  const isApproved = !new BigNumber(allowance!).isEqualTo(0);
  const showApproveButton =
    !isApproved || new BigNumber(amount).isGreaterThan(allowance!);

  const isDisabled = React.useMemo<boolean>(() => {
    if (requireApproval) {
      return (
        !isApproved ||
        !amount ||
        new BigNumber(amount).isLessThanOrEqualTo('0') ||
        new BigNumber(amount).isGreaterThan(maximum)
      );
    }

    return (
      !amount ||
      new BigNumber(amount).isLessThanOrEqualTo('0') ||
      new BigNumber(amount).isGreaterThan(maximum) ||
      new BigNumber(amount).isLessThan(minimum)
    );
  }, [amount, isApproved, maximum, requireApproval, minimum]);
  let approveContent = null;

  if (showApproveButton) {
    if (
      approveTxDispatch &&
      approveTxState &&
      approveTxState.txState !== TxState.Default
    ) {
      approveContent = (
        <TransactionCallout
          state={approveTxState}
          pendingHeading={`Approve ${currency} for staking on Vega`}
          reset={() =>
            approveTxDispatch({ type: TransactionActionType.TX_RESET })
          }
        />
      );
    } else {
      approveContent = (
        <button
          data-testid="token-input-approve-button"
          className="fill token-input__submit"
          onClick={approve}
        >
          {approveText}
        </button>
      );
    }
  } else if (requireApproval) {
    approveContent = (
      <Callout
        iconName="tick"
        intent={Intent.Success}
        title={`${currency} are approved for staking`}
      />
    );
  }
  return (
    <FormGroup label="" labelFor={inputName}>
      <AmountInput
        amount={amount}
        setAmount={setAmount}
        maximum={maximum}
        currency={currency}
      />
      {approveContent}
      <button
        data-testid="token-input-submit-button"
        className="fill token-input__submit"
        disabled={isDisabled}
        onClick={perform}
      >
        {submitText}
      </button>
    </FormGroup>
  );
};
