import { Link } from 'react-router-dom';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { formatNumber } from '@vegaprotocol/utils';
import { type useTeams } from '../../lib/hooks/use-teams';
import { useT } from '../../lib/use-t';
import { Table } from '../table';
import { Rank } from './graphics/rank';
import { Links } from '../../lib/links';
import { TeamAvatar } from './team-avatar';

export const CompetitionsLeaderboard = ({
  data,
}: {
  data: ReturnType<typeof useTeams>['data'];
}) => {
  const t = useT();

  const num = (n?: number | string) => (!n ? '-' : formatNumber(n, 0));

  if (!data || data.length === 0) {
    return <Splash>{t('Could not find any teams')}</Splash>;
  }

  return (
    <Table
      columns={[
        { name: 'rank', displayName: '#' },
        { name: 'avatar', displayName: '' },
        { name: 'team', displayName: t('Team') },
        { name: 'earned', displayName: t('Rewards earned') },
        { name: 'games', displayName: t('Total games') },
        { name: 'status', displayName: t('Status') },
        { name: 'volume', displayName: t('Volume') },
      ]}
      data={data.map((td) => {
        // leaderboard place or medal
        let rank: number | React.ReactNode = td.rank;
        if (rank === 1) rank = <Rank variant="gold" />;
        if (rank === 2) rank = <Rank variant="silver" />;
        if (rank === 3) rank = <Rank variant="bronze" />;

        const avatar = (
          <TeamAvatar
            teamId={td.teamId}
            imgUrl={td.avatarUrl}
            alt={td.name}
            size="small"
          />
        );

        return {
          rank,
          avatar,
          team: (
            <Link
              className="hover:underline"
              to={Links.COMPETITIONS_TEAM(td.teamId)}
            >
              {
                // Its possible for a tx to be submitted with an empty space as team name
                td.name.trim() !== '' ? td.name : t('[empty]')
              }
            </Link>
          ),
          earned: num(td.totalQuantumRewards),
          games: num(td.totalGamesPlayed),
          status: td.closed ? t('Closed') : t('Open'),
          volume: num(td.totalQuantumVolume),
        };
      })}
    />
  );
};
