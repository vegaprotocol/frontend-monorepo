import {
  TradingButton as Button,
  Dialog,
  Intent,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  useSimpleTransaction,
  useVegaWallet,
} from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import { type Team } from '../../lib/hooks/use-team';
import { useState } from 'react';

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
      <Dialog
        open={confirmDialog !== undefined}
        onChange={() => setConfirmDialog(undefined)}
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
      </Dialog>
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

  const { send, status, error } = useSimpleTransaction({
    onSuccess: refetch,
  });

  const joinTeam = () => {
    send({
      joinTeam: {
        id: team.teamId,
      },
    });
  };

  if (error) {
    return (
      <p className="text-vega-red break-words first-letter:capitalize">
        {error}
      </p>
    );
  }

  if (status === 'requested') {
    return <p>{t('Confirm in wallet...')}</p>;
  }

  if (status === 'pending') {
    return <p>{t('Confirming transaction...')}</p>;
  }

  if (status === 'confirmed') {
    if (type === 'switch') {
      return (
        <p>
          {t(
            'Team switch successful. You will switch team at the end of the epoch.'
          )}
        </p>
      );
    }

    return <p>{t('Team joined')}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {type === 'switch' && (
        <>
          <h2 className="font-alpha text-xl">{t('Switch team')}</h2>
          <p>
            {t(
              "Switching team will move you from '{{fromTeam}}' to '{{toTeam}}' at the end of the epoch. Are you sure?",
              {
                fromTeam: partyTeam?.name,
                toTeam: team.name,
              }
            )}
          </p>
        </>
      )}
      {type === 'join' && (
        <>
          <h2 className="font-alpha text-xl">{t('Join team')}</h2>
          <p>
            {t('Are you sure you want to join team: {{team}}', {
              team: team.name,
            })}
          </p>
        </>
      )}
      <div className="flex justify-between gap-2">
        <Button
          onClick={joinTeam}
          intent={Intent.Success}
          data-testid="confirm-switch-button"
        >
          {t('Confirm')}
        </Button>
        <Button onClick={onCancel} intent={Intent.Danger}>
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
};
