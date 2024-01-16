import { Link } from 'react-router-dom';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { getNumberFormat } from '@vegaprotocol/utils';
import { type useTeams } from '../../client-pages/competitions/hooks/use-teams';
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

  const num = (n?: number | string) =>
    !n ? '-' : getNumberFormat(0).format(Number(n));

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
        { name: 'members', displayName: t('No. of members') },
        { name: 'status', displayName: t('Status') },
        { name: 'volume', displayName: t('Volume') },
      ]}
      data={data.map((td, i) => {
        // leaderboard place or medal
        let rank: number | React.ReactNode = i + 1;
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
              {td.name}
            </Link>
          ),
          earned: num(td.totalQuantumRewards),
          games: num(td.totalGamesPlayed),
          members: 0,
          status: td.closed ? t('Closed') : t('Open'),
          volume: num(td.totalQuantumVolume),
        };
      })}
    ></Table>
  );
};
