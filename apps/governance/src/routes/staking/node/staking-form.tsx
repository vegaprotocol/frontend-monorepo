import { useApolloClient } from '@apollo/client';
import * as Sentry from '@sentry/react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ENV } from '../../../config';
import { vega as VegaProtos } from '@vegaprotocol/protos';
import { usePartyDelegationsLazyQuery } from './__generated__/PartyDelegations';
import { TokenInput } from '../../../components/token-input';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { useSearchParams } from '../../../hooks/use-search-params';
import { BigNumber } from '../../../lib/bignumber';
import { StakingFormTxStatuses } from './staking-form-tx-statuses';
import {
  ButtonLink,
  FormGroup,
  Intent,
  Notification,
  Radio,
  RadioGroup,
} from '@vegaprotocol/ui-toolkit';
import {
  removeDecimal,
  addDecimal,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import {
  useNetworkParam,
  NetworkParams,
} from '@vegaprotocol/network-parameters';
import { useBalances } from '../../../lib/balances/balances-store';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { SubHeading } from '../../../components/heading';
import type {
  DelegateSubmissionBody,
  UndelegateSubmissionBody,
} from '@vegaprotocol/wallet';
import Routes from '../../routes';

export enum FormState {
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
  pubKey: string;
  nodeName: string;
  availableStakeToAdd: BigNumber;
  availableStakeToRemove: BigNumber;
}

export const StakingForm = ({
  nodeId,
  pubKey,
  nodeName,
  availableStakeToAdd,
  availableStakeToRemove,
}: StakingFormProps) => {
  const lien = useBalances((state) => state.lien);
  const params = useSearchParams();
  const navigate = useNavigate();
  const client = useApolloClient();
  const { appState } = useAppState();
  const { sendTx } = useVegaWallet();
  const [formState, setFormState] = React.useState(FormState.Default);
  const [error, setError] = useState<Error | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const { t } = useTranslation();
  const { delegationsPagination } = ENV;
  const [action, setAction] = React.useState<StakeAction>(
    params.action as StakeAction
  );
  const [amount, setAmount] = React.useState('');
  const [removeType, setRemoveType] = React.useState<RemoveType>(
    RemoveType.EndOfEpoch
  );
  // Clear the amount when the staking method changes
  React.useEffect(() => {
    setAmount('');
  }, [action, setAmount]);

  const { param: minAmount } = useNetworkParam(
    NetworkParams.validators_delegation_minAmount
  );

  const minTokensWithDecimals = React.useMemo(() => {
    const minTokens = minAmount !== null ? minAmount : '';
    return addDecimal(minTokens, appState.decimals);
  }, [appState.decimals, minAmount]);

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
    setIsDialogVisible(true);
    const delegateInput: DelegateSubmissionBody = {
      delegateSubmission: {
        nodeId,
        amount: removeDecimal(amount, appState.decimals),
      },
    };
    const undelegateInput: UndelegateSubmissionBody = {
      undelegateSubmission: {
        nodeId,
        amount: removeDecimal(amount, appState.decimals),
        method:
          removeType === RemoveType.Now
            ? VegaProtos.commands.v1.UndelegateSubmission.Method.METHOD_NOW
            : VegaProtos.commands.v1.UndelegateSubmission.Method
                .METHOD_AT_END_OF_EPOCH,
      },
    };
    try {
      const command = action === Actions.Add ? delegateInput : undelegateInput;
      const res = await sendTx(pubKey, command);
      if (res) {
        setFormState(FormState.Pending);
      } else {
        setFormState(FormState.Default);
      }

      // await success via poll
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
      setFormState(FormState.Failure);
      Sentry.captureException(err);
    }
  }

  const [delegationSearch, { data }] = usePartyDelegationsLazyQuery({
    variables: {
      partyId: pubKey,
      delegationsPagination: delegationsPagination
        ? {
            first: Number(delegationsPagination),
          }
        : undefined,
    },
    fetchPolicy: 'network-only',
  });

  React.useEffect(() => {
    // eslint-disable-next-line
    let interval: any;

    if (formState === FormState.Pending) {
      // start polling for delegation
      interval = setInterval(() => {
        delegationSearch();

        if (data) {
          const delegation = removePaginationWrapper(
            data.party?.delegationsConnection?.edges
          ).find((d) => {
            return (
              d.node.id === nodeId && d.epoch === Number(data.epoch.id) + 1
            );
          });

          if (delegation) {
            setFormState(FormState.Success);
            clearInterval(interval);
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [formState, client, pubKey, nodeId, delegationSearch, data, error]);

  const toggleDialog = useCallback(() => {
    setIsDialogVisible(!isDialogVisible);
  }, [isDialogVisible]);

  return (
    <div className="my-8">
      <SubHeading title={t('Manage your stake')} />
      {formState === FormState.Default &&
        availableStakeToAdd.isEqualTo(0) &&
        availableStakeToRemove.isEqualTo(0) && (
          <div className="mb-4">
            {lien.isGreaterThan(0) ? (
              <Notification
                intent={Intent.Warning}
                message={t('stakeNodeWrongVegaKey')}
              />
            ) : (
              <Notification
                message={t('stakeNodeNone')}
                intent={Intent.Warning}
                buttonProps={{
                  text: t('associateVegaNow'),
                  action: () => navigate(Routes.ASSOCIATE),
                  className: 'py-1',
                  size: 'sm',
                }}
              />
            )}
          </div>
        )}

      <div className="mb-8">
        <FormGroup
          label={t('Select if you want to add or remove stake')}
          labelFor="radio-stake-options"
          hideLabel={true}
        >
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
              disabled={availableStakeToAdd.isEqualTo(0)}
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
      </div>

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
      <StakingFormTxStatuses
        formState={formState}
        nodeName={nodeName}
        amount={amount}
        action={action}
        removeType={removeType}
        isDialogVisible={isDialogVisible}
        toggleDialog={toggleDialog}
        error={error}
      />
    </div>
  );
};
