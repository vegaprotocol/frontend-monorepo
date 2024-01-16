import { ErrorBoundary } from '@sentry/react';
import { CompetitionsHeader } from '../../components/competitions/competitions-header';
import { usePageTitleStore } from '../../stores';
import { useEffect, useRef, useState } from 'react';
import { useT } from '../../lib/use-t';
import { titlefy } from '@vegaprotocol/utils';
import { useTeams } from './hooks/use-teams';
import { CompetitionsLeaderboard } from '../../components/competitions/competitions-leaderboard';
import {
  Input,
  Loader,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';

export const CompetitionsTeams = () => {
  const t = useT();
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));
  useEffect(() => {
    updateTitle(titlefy([t('Competitions'), t('Teams')]));
  }, [updateTitle, t]);

  const { data: teamsData, loading: teamsLoading } = useTeams({
    sortByField: ['totalQuantumRewards'],
    order: 'desc',
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // const teamsData = [
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       '8d81a2ba54c21cbb891e46a2a8debac508b33ee83e2d7c3b8a5bcd420753515e',
  //     name: 'cat lovers 2000',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       'afe0f77322c9bc9ebe36faa8b0d846617018b86db78f33cadbe09dc15c95f408',
  //     name: 'dog lovers 2000',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       '580e52a0ef7f706898c6e0a3a34a6f870ef2a49e191408a3e1ed2c0a92e6e588',
  //     name: 'we like vega',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       '38c49f91670f536ce5ab6609899780cfb6bb9dcfc6c79842cbc348325e10c10f',
  //     name: 'pure gold',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       'dfaaace4de83cab2443ebd7f75dc0d9a22a4f4a38f757b3adb5269aa930e0bdc',
  //     name: 'diamond hands',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       '1627a2ea10b07ed9cf08bfc7818bd76716493f5e6a5b5ffe4ed856ef34602a14',
  //     name: 'to the moon',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       'd21f7b04985e5b5f510a53ee61c4d77c100374eafeffd754b5296d386b7454da',
  //     name: 'beyond cats',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       'a40339f4cf31f4496e4d85ac7f56d5bbc9e257a337070fa361205c1f2fdaa0eb',
  //     name: 'cat lovers 2000',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       'af059e7508a302cce9523edcbde52bf7f2e876f34854c6274a83aec4045b9657',
  //     name: 'cat lovers 2000',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       '3f06f0e0ec863e686212d6b100f03122c9997f890d304f15f55215ac32334e6f',
  //     name: 'cat lovers 2000',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  //   {
  //     referrer: '12345678909876543212345678765432345676543234567',
  //     avatarUrl: '',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId:
  //       '0fdc948a548ccd29001c2411629065bc5e248b6535b59b4b089f07a577074bf9',
  //     name: 'cat lovers 2000',
  //     totalQuantumRewards: '1234567890',
  //     totalGamesPlayed: 12,
  //     totalQuantumVolume: '1234567890',
  //     gamesPlayed: [],
  //     createdAt: 123,
  //     createdAtEpoch: 123,
  //   },
  // ];

  const [filter, setFilter] = useState<string | null | undefined>(undefined);

  return (
    <ErrorBoundary>
      <CompetitionsHeader title={t('Join a team')}>
        <p className="text-lg mb-1">{t('Choose a team to get involved')}</p>x
      </CompetitionsHeader>

      <div className="mb-6 flex justify-end">
        <div className="w-40 h-10 relative">
          <span className="absolute z-10 pointer-events-none opacity-90 top-[5px] left-[5px]">
            <VegaIcon name={VegaIconNames.SEARCH} size={18} />
          </span>
          <Input
            ref={inputRef}
            className="opacity-90 text-right"
            placeholder={t('Name')}
            onKeyUp={() => {
              const value = inputRef.current?.value;
              if (value != filter) setFilter(value);
            }}
          />
        </div>
      </div>
      <div>
        {teamsLoading ? (
          <Loader size="small" />
        ) : (
          <CompetitionsLeaderboard
            data={teamsData.filter((td) => {
              if (filter && filter.length > 0) {
                const re = new RegExp(filter, 'i');
                return re.test(td.name);
              }
              return true;
            })}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};
