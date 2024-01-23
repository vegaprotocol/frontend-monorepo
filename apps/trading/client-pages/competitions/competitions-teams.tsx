import { ErrorBoundary } from '@sentry/react';
import { CompetitionsHeader } from '../../components/competitions/competitions-header';
import { useRef, useState } from 'react';
import { useT } from '../../lib/use-t';
import { useTeams } from './hooks/use-teams';
import { CompetitionsLeaderboard } from '../../components/competitions/competitions-leaderboard';
import {
  Input,
  Loader,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { usePageTitle } from '../../lib/hooks/use-page-title';

export const CompetitionsTeams = () => {
  const t = useT();

  usePageTitle([t('Competitions'), t('Teams')]);

  const { data: teamsData, loading: teamsLoading } = useTeams({
    sortByField: ['totalQuantumRewards'],
    order: 'desc',
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<string | null | undefined>(undefined);

  return (
    <ErrorBoundary>
      <CompetitionsHeader title={t('Join a team')}>
        <p className="text-lg mb-1">{t('Choose a team to get involved')}</p>
      </CompetitionsHeader>

      <div className="mb-6 flex justify-end">
        <div className="w-full md:w-60 h-10 relative">
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
