import {
  TradingButton as Button,
  TradingDialog,
  Intent,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  TxStatus,
  useSimpleTransaction,
  useVegaWallet,
} from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import { type Team } from '../../lib/hooks/use-team';
import { useState } from 'react';
import { t } from 'i18next';
import { TransactionSteps } from '../../components/transaction-dialog/transaction-steps';

type JoinType = 'switch' | 'join';

export const JoinTeam = ({
  team,
  partyTeam,
  refetch,
}: {
  team: Team;
  partyTeam?: Team;
  refetch: () => void;
}) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const [confirmDialog, setConfirmDialog] = useState<JoinType>();

  return (
    <>
      <JoinButton
        team={team}
        partyTeam={partyTeam}
        pubKey={pubKey}
        isReadOnly={isReadOnly}
        onJoin={setConfirmDialog}
      />
      <TradingDialog
        title={confirmDialog === 'switch' ? t('Switch team') : t('Join team')}
        open={confirmDialog !== undefined}
        onOpenChange={() => setConfirmDialog(undefined)}
      >
        {confirmDialog !== undefined && (
          <DialogContent
            type={confirmDialog}
            team={team}
            partyTeam={partyTeam}
            onCancel={() => setConfirmDialog(undefined)}
            refetch={refetch}
          />
        )}
      </TradingDialog>
    </>
  );
};

export const JoinButton = ({
  pubKey,
  isReadOnly,
  team,
  partyTeam,
  onJoin,
}: {
  pubKey: string | undefined;
  isReadOnly: boolean;
  team: Team;
  partyTeam?: Team;
  onJoin: (type: JoinType) => void;
}) => {
  const t = useT();

  /**
   * A team cannot be joined (closed) when set as such
   * and the currently connected pubkey is not whitelisted.
   */
  const isTeamClosed = team.closed && !team.allowList.includes(pubKey || '');

  if (!pubKey || isReadOnly) {
    return (
      <Tooltip description={t('Connect your wallet to join the team')}>
        <Button intent={Intent.Primary} disabled={true}>
          {t('Join team')}{' '}
        </Button>
      </Tooltip>
    );
  }

  // Party is the creator of a team
  if (partyTeam && partyTeam.referrer === pubKey) {
    // Party is the creator of THIS team
    if (partyTeam.teamId === team.teamId) {
      return (
        <Button intent={Intent.None} disabled={true}>
          <span className="flex items-center gap-2">
            {t('Owner')}{' '}
            <span className="text-vega-green-600 dark:text-vega-green">
              <VegaIcon name={VegaIconNames.TICK} />
            </span>
          </span>
        </Button>
      );
    } else {
      // Not creator of the team, but still can't switch because
      // creators cannot leave their own team
      return (
        <Tooltip description={t('As a team creator, you cannot switch teams')}>
          <Button intent={Intent.Primary} disabled={true}>
            {t('Switch team')}{' '}
          </Button>
        </Tooltip>
      );
    }
  }

  // Party is in a team, but not this one
  if (partyTeam && partyTeam.teamId !== team.teamId) {
    // This team is closed.
    if (isTeamClosed) {
      return (
        <Tooltip description={t('You cannot join a private team')}>
          <Button
            intent={Intent.Primary}
            data-testid="switch-team-button"
            disabled={true}
          >
            {t('Switch team')}{' '}
          </Button>
        </Tooltip>
      );
    }
    // This team is open.
    return (
      <Button
        onClick={() => onJoin('switch')}
        intent={Intent.Primary}
        data-testid="switch-team-button"
      >
        {t('Switch team')}{' '}
      </Button>
    );
  }

  // Joined. Current party is already in this team
  if (partyTeam && partyTeam.teamId === team.teamId) {
    return (
      <Button intent={Intent.None} disabled={true}>
        <span className="flex items-center gap-2">
          {t('Joined')}{' '}
          <span className="text-vega-green-600 dark:text-vega-green">
            <VegaIcon name={VegaIconNames.TICK} />
          </span>
        </span>
      </Button>
    );
  }

  // This team is closed.
  if (isTeamClosed) {
    return (
      <Tooltip description={t('You cannot join a closed team')}>
        <Button intent={Intent.Primary} disabled={true}>
          {t('Join team')}
        </Button>
      </Tooltip>
    );
  }
  // This team is open.
  return (
    <Button onClick={() => onJoin('join')} intent={Intent.Primary}>
      {t('Join team')}
    </Button>
  );
};

const DialogContent = ({
  type,
  team,
  partyTeam,
  onCancel,
  refetch,
}: {
  type: JoinType;
  team: Team;
  partyTeam?: Team;
  onCancel: () => void;
  refetch: () => void;
}) => {
  const t = useT();

  const { send, result, status, error, reset } = useSimpleTransaction({
    onSuccess: refetch,
  });

  const closeDialog = () => {
    reset();
    onCancel();
  };

  const joinTeam = () => {
    send({
      joinTeam: {
        id: team.teamId,
      },
    });
  };

  if (status !== TxStatus.Idle) {
    let confirmedLabel = t('Team joined');
    if (type === 'switch') {
      confirmedLabel = t(
        'Team switch successful. You will switch team at the end of the epoch.'
      );
    }

    return (
      <TransactionSteps
        status={status}
        result={result}
        error={error}
        reset={closeDialog}
        confirmedLabel={confirmedLabel}
        resetLabel={t('Back to team')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {type === 'switch' && (
        <p>
          {t(
            "Switching team will move you from '{{fromTeam}}' to '{{toTeam}}' at the end of the epoch. Are you sure?",
            {
              fromTeam: partyTeam?.name,
              toTeam: team.name,
            }
          )}
        </p>
      )}
      {type === 'join' && (
        <p>
          {t('Are you sure you want to join team: {{team}}', {
            team: team.name,
          })}
        </p>
      )}
      <div className="flex justify-between gap-2">
        <Button
          size="large"
          className="w-1/2"
          onClick={joinTeam}
          intent={Intent.Success}
          data-testid="confirm-switch-button"
        >
          {t('Confirm')}
        </Button>
        <Button
          size="large"
          className="w-1/2"
          onClick={onCancel}
          intent={Intent.Danger}
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
};
