import { useApolloClient } from '@apollo/client';
import * as Sentry from '@sentry/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { TokenInput } from '../../components/token-input';
import { NetworkParams } from '../../config';
import { useAppState } from '../../contexts/app-state/app-state-context';
import { useSearchParams } from '../../hooks/use-search-params';
import { BigNumber } from '../../lib/bignumber';
import { addDecimal, removeDecimal } from '../../lib/decimals';
import { StakeFailure } from './stake-failure';
import { StakePending } from './stake-pending';
import { StakeSuccess } from './stake-success';
import {
  ButtonLink,
  Callout,
  FormGroup,
  Intent,
  Radio,
  RadioGroup,
} from '@vegaprotocol/ui-toolkit';
import type {
  DelegateSubmissionBody,
  UndelegateSubmissionBody,
} from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useNetworkParam } from '@vegaprotocol/react-helpers';
import { usePartyDelegations } from '../../components/vega-wallet/use-party-delegations';

enum FormState {
  Default,
  Requested,
  Pending,
  Success,
  Failure,
}

export enum Actions {
  Add = 'Add',
  Remove = 'Remove',
}
export type StakeAction = Actions | undefined;
export enum RemoveType {
  EndOfEpoch,
  Now,
}

interface StakingFormProps {
  nodeId: string;
  pubkey: string;
  nodeName: string;
  availableStakeToAdd: BigNumber;
  availableStakeToRemove: BigNumber;
  currentEpoch: string | undefined;
}

export const StakingForm = ({
  nodeId,
  pubkey,
  nodeName,
  availableStakeToAdd,
  availableStakeToRemove,
  currentEpoch,
}: StakingFormProps) => {
  const params = useSearchParams();
  const navigate = useNavigate();
  const client = useApolloClient();
  const { appState } = useAppState();
  const { sendTx } = useVegaWallet();
  const [formState, setFormState] = React.useState(FormState.Default);
  const { t } = useTranslation();
  const [action, setAction] = React.useState<StakeAction>(
    params.action as StakeAction
  );
  const [amount, setAmount] = React.useState('');
  const [removeType, setRemoveType] = React.useState<RemoveType>(
    RemoveType.EndOfEpoch
  );
  // Clear the amount when the staking method changes
  const delegations = usePartyDelegations(pubkey);
  React.useEffect(() => {
    setAmount('');
  }, [action, setAmount]);

  const { data } = useNetworkParam(
    NetworkParams.VALIDATOR_DELEGATION_MIN_AMOUNT
  );

  const minTokensWithDecimals = React.useMemo(() => {
    const minTokens = new BigNumber(data && data.length === 1 ? data[0] : '');
    return addDecimal(minTokens, appState.decimals);
  }, [appState.decimals, data]);

  const maxDelegation = React.useMemo(() => {
    if (action === Actions.Add) {
      return availableStakeToAdd;
    }

    if (action === Actions.Remove) {
      return availableStakeToRemove;
    }

    return new BigNumber(0);
  }, [action, availableStakeToAdd, availableStakeToRemove]);

  async function onSubmit() {
    setFormState(FormState.Requested);
    const delegateInput: DelegateSubmissionBody = {
      pubKey: pubkey,
      propagate: true,
      delegateSubmission: {
        nodeId,
        amount: removeDecimal(new BigNumber(amount), appState.decimals),
      },
    };
    const undelegateInput: UndelegateSubmissionBody = {
      pubKey: pubkey,
      propagate: true,
      undelegateSubmission: {
        nodeId,
        amount: removeDecimal(new BigNumber(amount), appState.decimals),
        method:
          removeType === RemoveType.Now
            ? 'METHOD_NOW'
            : 'METHOD_AT_END_OF_EPOCH',
      },
    };
    try {
      const command = action === Actions.Add ? delegateInput : undelegateInput;
      await sendTx(command);
      setFormState(FormState.Pending);

      // await success via poll
    } catch (err) {
      setFormState(FormState.Failure);
      Sentry.captureException(err);
    }
  }

  React.useEffect(() => {
    if (formState === FormState.Pending) {
      const delegation = delegations?.find((d) => {
        return (
          d.nodeId === nodeId && Number(d.epochSeq) === Number(currentEpoch) + 1
        );
      });

      if (delegation) {
        setFormState(FormState.Success);
      }
    }
  }, [formState, client, pubkey, nodeId, delegations, currentEpoch]);
  
  const isLeavingNode = useMemo(() => {
    return ['efbdf943443bd7595e83b0d7e88f37b7932d487d1b94aab3d004997273bb43fc', '5db9794f44c85b4b259907a00c8ea2383ad688dfef6ffb72c8743b6ae3eaefd4'].includes(nodeId)
  }, [nodeId])

  if (formState === FormState.Failure) {
    return <StakeFailure nodeName={nodeName} />;
  } else if (formState === FormState.Requested) {
    return (
      <Callout title="Confirm transaction in wallet" intent={Intent.Warning}>
        <p>{t('stakingConfirm')}</p>
      </Callout>
    );
  } else if (formState === FormState.Pending) {
    return <StakePending action={action} amount={amount} nodeName={nodeName} />;
  } else if (formState === FormState.Success) {
    return (
      <StakeSuccess
        action={action}
        amount={amount}
        nodeName={nodeName}
        removeType={removeType}
      />
    );
  } 
  // else if (
  //   availableStakeToAdd.isEqualTo(0) &&
  //   availableStakeToRemove.isEqualTo(0)
  // ) {
  //   if (appState.lien.isGreaterThan(0)) {
  //     return <span className="text-red">{t('stakeNodeWrongVegaKey')}</span>;
  //   } else {
  //     return <span className="text-red">{t('stakeNodeNone')}</span>;
  //   }
  // }

  return (
    <>
      <h2>{t('Manage your stake')}</h2>
      <FormGroup
        label={t('Select if you want to add or remove stake')}
        labelFor="radio-stake-options"
        hideLabel={true}
      >
        {isLeavingNode ? <div className='mb-4'>
          <Callout intent={Intent.Warning}>
            {t('validatorLeavingWarning')}
          </Callout>
        </div> : null}
        <RadioGroup
          name="radio-stake-options"
          onChange={(value) => {
            // @ts-ignore value does exist on target
            setAction(value);
            navigate(`?action=${value}`, {
              replace: true,
            });
          }}
          value={action}
        >
          <Radio
            disabled={availableStakeToAdd.isEqualTo(0) || isLeavingNode}
            value={Actions.Add}
            label="Add"
            id="add-stake-radio"
          />
          <Radio
            disabled={availableStakeToRemove.isEqualTo(0)}
            value={Actions.Remove}
            label="Remove"
            id="remove-stake-radio"
          />
        </RadioGroup>
      </FormGroup>
      {action !== undefined && (
        // eslint-disable-next-line
        <>
          {action === Actions.Add ? (
            <>
              <h2>{t('How much to Add in next epoch?')}</h2>
              <p>
                {t('minimumNomination', {
                  minTokens: minTokensWithDecimals,
                })}{' '}
              </p>
              <TokenInput
                submitText={`Add ${amount ? amount : ''} ${t('vegaTokens')}`}
                perform={onSubmit}
                amount={amount}
                setAmount={setAmount}
                maximum={maxDelegation}
                minimum={new BigNumber(minTokensWithDecimals)}
                currency={t('VEGA Tokens')}
              />
            </>
          ) : (
            <>
              <h2>{t('How much to Remove?')}</h2>
              {removeType === RemoveType.Now ? (
                <p>
                  {t(
                    'Removing stake mid epoch will forsake any staking rewards from that epoch'
                  )}
                </p>
              ) : null}
              <TokenInput
                submitText={t('undelegateSubmitButton', {
                  amount: t('Remove {{amount}} VEGA tokens', { amount }),
                  when:
                    removeType === RemoveType.Now
                      ? t('as soon as possible')
                      : t('at the end of epoch'),
                })}
                perform={onSubmit}
                amount={amount}
                setAmount={setAmount}
                maximum={maxDelegation}
                currency={t('VEGA Tokens')}
              />
              {removeType === RemoveType.Now ? (
                <>
                  <p>{t('Want to remove your stake before the epoch ends?')}</p>
                  <ButtonLink
                    onClick={() => setRemoveType(RemoveType.EndOfEpoch)}
                  >
                    {t('Switch to form for removal at end of epoch')}
                  </ButtonLink>
                </>
              ) : (
                <>
                  <p>
                    {t('Want to remove your stake at the end of the epoch?')}
                  </p>
                  <ButtonLink onClick={() => setRemoveType(RemoveType.Now)}>
                    {t('Switch to form for immediate removal')}
                  </ButtonLink>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};
