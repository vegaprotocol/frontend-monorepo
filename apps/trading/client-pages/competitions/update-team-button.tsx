import { type Team } from '../../lib/hooks/use-team';
import { type ComponentProps } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { Intent, AnchorButton } from '@vegaprotocol/ui-toolkit';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';

export const UpdateTeamButton = ({
  team,
  size = 'md',
}: {
  team: Pick<Team, 'teamId' | 'referrer'>;
  size?: ComponentProps<typeof AnchorButton>['size'];
}) => {
  const t = useT();
  const { pubKey, isReadOnly } = useVegaWallet();

  if (pubKey && !isReadOnly && pubKey === team.referrer) {
    return (
      <AnchorButton
        size={size}
        data-testid="update-team-button"
        href={Links.COMPETITIONS_UPDATE_TEAM(team.teamId)}
        intent={Intent.Info}
      >
        {t('Update team')}
      </AnchorButton>
    );
  }

  return null;
};
