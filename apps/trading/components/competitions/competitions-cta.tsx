import { type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  Button,
  type ButtonProps,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import { Role } from '../../lib/hooks/use-my-team';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';
import { Box } from './box';

export const CompetitionsActionsContainer = ({
  children,
}: {
  children:
    | ReactElement<typeof CompetitionsAction>
    | Iterable<ReactElement<typeof CompetitionsAction>>;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">{children}</div>
);

export const CompetitionsAction = ({
  variant,
  title,
  description,
  actionElement,
}: {
  variant: 'create-team' | 'create-solo-team' | 'join-team';
  title: string;
  description?: string;
  actionElement: ReactNode;
}) => {
  return (
    <Box className="grid md:grid-rows-[subgrid] gap-6 row-span-4 text-center">
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/${variant}.svg`}
          className="block rounded-full w-24 h-24"
          alt={`Icon for ${title}`}
        />
      </div>
      <h2 className="text-2xl">{title}</h2>
      {description && <p className="text-surface-1-fg-muted">{description}</p>}
      <div className="flex justify-center">{actionElement}</div>
    </Box>
  );
};

export const ActionButton = ({
  tooltip,
  ...buttonProps
}: ButtonProps & {
  tooltip?: string;
}) => (
  <Tooltip description={tooltip}>
    <Button {...buttonProps} />
  </Tooltip>
);

export const CompetitionsActions = ({
  myRole,
  myTeamId,
  onAction,
}: {
  myRole: Role | undefined;
  myTeamId: string | undefined;
  onAction?: () => void;
}) => {
  const t = useT();
  const navigate = useNavigate();
  type event = { preventDefault: () => void };

  /** Action A */
  let createTeamBtnProps: ComponentProps<typeof ActionButton> = {
    intent: Intent.Primary,
    children: t('Create a team'),
    disabled: false,
    onClick: (e: event) => {
      e.preventDefault();
      onAction?.();
      navigate(Links.COMPETITIONS_CREATE_TEAM());
    },
    tooltip: undefined,
    // @ts-ignore Button takes all button element attributes
    'data-testid': 'create-public-team-button',
  };

  /** Action B */
  let createPrivateTeamBtnProps: ComponentProps<typeof ActionButton> = {
    intent: Intent.Primary,
    children: t('Create my profile'),
    disabled: false,
    onClick: (e: event) => {
      e.preventDefault();
      onAction?.();
      navigate(Links.COMPETITIONS_CREATE_TEAM_SOLO());
    },
    tooltip: undefined,
    // @ts-ignore Button takes all button element attributes
    'data-testid': 'create-private-team-button',
  };

  /** Action C */
  let chooseTeamBtnProps: ComponentProps<typeof ActionButton> = {
    intent: Intent.Primary,
    children: t('Choose a team'),
    disabled: false,
    onClick: (e: event) => {
      e.preventDefault();
      onAction?.();
      navigate(Links.COMPETITIONS_TEAMS());
    },
    tooltip: undefined,
    // @ts-ignore Button takes all button element attributes
    'data-testid': 'choose-team-button',
  };

  if (myRole === Role.NOT_IN_TEAM_BUT_REFERRER) {
    /** A */
    createTeamBtnProps = {
      ...createTeamBtnProps,
      children: t('Upgrade to team'),
      tooltip: t('Upgrade your existing referral set to a team'),
      disabled: myTeamId == null,
    };
    /** B */
    createPrivateTeamBtnProps = {
      ...createPrivateTeamBtnProps,
      children: t('Upgrade to private team'),
      tooltip: t('Upgrade your existing referral set to a private team.'),
      disabled: myTeamId == null,
    };
    /** C */
    chooseTeamBtnProps = {
      ...chooseTeamBtnProps,
      disabled: true,
      tooltip: t(
        'As the creator of a referral set you cannot join another team.'
      ),
    };
  }

  if (myRole === Role.NOT_IN_TEAM_BUT_REFEREE) {
    /** A */
    createTeamBtnProps = {
      ...createTeamBtnProps,
      disabled: true,
      tooltip: t(
        'As a member of a referral set you cannot create a team, but you can join one.'
      ),
    };
    /** B */
    createPrivateTeamBtnProps = {
      ...createPrivateTeamBtnProps,
      disabled: true,
      tooltip: t(
        'As a member of a referral set you cannot create a team, but you can join one.'
      ),
    };
  }

  return (
    <CompetitionsActionsContainer>
      <CompetitionsAction
        variant="create-solo-team"
        title={t('Play as individual')}
        description={t(
          'Want to compete but think the best team size is one? This is the option for you.'
        )}
        actionElement={<ActionButton {...createPrivateTeamBtnProps} />}
      />
      <CompetitionsAction
        variant="create-team"
        title={t('Create a team')}
        description={t(
          'Create a new team, share your code with potential members, or set a whitelist for an exclusive group.'
        )}
        actionElement={<ActionButton {...createTeamBtnProps} />}
      />
      <CompetitionsAction
        variant="join-team"
        title={t('Join a team')}
        description={t(
          'Browse existing public teams to find your perfect match.'
        )}
        actionElement={<ActionButton {...chooseTeamBtnProps} />}
      />
    </CompetitionsActionsContainer>
  );
};
