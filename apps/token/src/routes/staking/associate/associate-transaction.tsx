import {
  Button,
  Callout,
  Link,
  Intent,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/react-helpers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouteLink } from 'react-router-dom';

import { TransactionCallout } from '../../../components/transaction-callout';
import type {
  TransactionAction,
  TransactionState,
} from '../../../hooks/transaction-reducer';
import {
  TransactionActionType,
  TxState,
} from '../../../hooks/transaction-reducer';
import { Routes } from '../../router-config';
import type { PartyStakeLinkings_party_stake_linkings } from './__generated__/PartyStakeLinkings';

export const AssociateTransaction = ({
  amount,
  vegaKey,
  state,
  dispatch,
  requiredConfirmations,
  linking,
}: {
  amount: string;
  vegaKey: string;
  state: TransactionState;
  dispatch: React.Dispatch<TransactionAction>;
  requiredConfirmations: number;
  linking: PartyStakeLinkings_party_stake_linkings | null;
}) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();

  const remainingConfirmations = React.useMemo(() => {
    return Math.max(
      0,
      requiredConfirmations - (state.txData.confirmations || 0)
    );
  }, [state.txData.confirmations, requiredConfirmations]);

  const title = React.useMemo(() => {
    const defaultTitle = t('Associating Tokens');
    if (remainingConfirmations <= 0) {
      return `${defaultTitle}. ${t('associationPendingWaitingForVega')}`;
    } else {
      return `${defaultTitle}. ${t('blockCountdown', {
        amount: remainingConfirmations,
      })}`;
    }
  }, [remainingConfirmations, t]);

  let derivedTxState: TxState = state.txState;

  if (state.txState === TxState.Complete && !linking) {
    derivedTxState = TxState.Pending;
  }

  if (derivedTxState === TxState.Pending) {
    return (
      <Callout
        icon={<Loader size="small" />}
        intent={Intent.Progress}
        title={title}
      >
        <p data-testid="transaction-pending-body">
          {t('Associating {{amount}} VEGA tokens with Vega key {{vegaKey}}', {
            amount,
            vegaKey,
          })}
        </p>
        <p>
          <Link
            title={t('View transaction on Etherscan')}
            target="_blank"
            href={`${ETHERSCAN_URL}/tx/${state.txData.hash}`}
          >
            {state.txData.hash}
          </Link>
        </p>
        <p data-testid="transaction-pending-footer">
          {t('pendingAssociationText', {
            confirmations: requiredConfirmations,
          })}
        </p>
      </Callout>
    );
  }

  return (
    <TransactionCallout
      completeHeading={t('Done')}
      completeBody={t(
        'Vega key {{vegaKey}} can now participate in governance and Nominate a validator with it’s stake.',
        { vegaKey }
      )}
      completeFooter={
        <RouteLink to={Routes.STAKING}>
          <Button className="fill">
            {t('Nominate Stake to Validator Node')}
          </Button>
        </RouteLink>
      }
      pendingHeading={t('Associating Tokens')}
      pendingBody={t(
        'Associating {{amount}} VEGA tokens with Vega key {{vegaKey}}',
        { amount, vegaKey }
      )}
      pendingFooter={t('pendingAssociationText')}
      state={{
        ...state,
        txState: derivedTxState,
      }}
      reset={() => dispatch({ type: TransactionActionType.TX_RESET })}
    />
  );
};
