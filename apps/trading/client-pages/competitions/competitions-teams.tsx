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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
  //     avatarUrl: 'http://placekitten.com/g/200/300',
  //     teamUrl: 'https://vega.xyz',
  //     closed: true,
  //     teamId: '123',
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
