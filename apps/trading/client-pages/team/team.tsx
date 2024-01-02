import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import {
  TradingButton as Button,
  Indicator,
  Intent,
  Pill,
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownItem,
  TradingDropdownTrigger,
  VegaIcon,
  VegaIconNames,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import BigNumber from 'bignumber.js';
import { useT } from '../../lib/use-t';
import { Table } from '../../components/table';
import { getDateFormat } from '@vegaprotocol/utils';

export const Team = () => {
  const t = useT();
  const [showGames, setShowGames] = useState(true);
  return (
    <div className="relative h-full overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-[40%] -z-10 bg-[40%_0px] bg-cover bg-no-repeat bg-local bg-[url(/cover.png)]">
        <div className="absolute top-o left-0 w-full h-full bg-gradient-to-t from-white dark:from-black to-transparent from-20% to-60%" />
      </div>
      <div className="flex flex-col gap-4 lg:gap-6 container p-4 mx-auto">
        <header className="flex gap-2 lg:gap-4 pt-5 lg:pt-10">
          <TeamAvatar />
          <div className="flex flex-col items-start gap-1 lg:gap-3">
            <h1 className="calt text-2xl lg:text-3xl xl:text-5xl">
              Vega Maxis long team name here
            </h1>
            <JoinButton joined={true} />
          </div>
        </header>
        <StatSection>
          <StatList>
            <Stat value={24} label={'Rank'} tooltip={'My rank description'} />
            <Stat value={486} label={'Members'} />
            <Stat
              value={7}
              label={'Total games'}
              tooltip={'My games description'}
            />
          </StatList>
          <StatSectionSeparator />
          <StatList>
            <Stat value={'4.76K'} label={'Total volume'} />
            <Stat
              value={'15.2K'}
              label={'Rewards paid'}
              tooltip={'My rewards paid description'}
            />
            <Stat
              value={
                <>
                  10K<span className="ml-2 text-sm">$VEGA</span>
                </>
              }
              label={<PnlLabel value={'-100'} />}
              tooltip={'PnL description'}
            />
          </StatList>
        </StatSection>
        <StatSection>
          <dl>
            <dt className="text-muted text-sm">Favorite game</dt>
            <dd>
              <Pill className="flex-inline items-center gap-2 bg-transparent text-sm">
                <VegaIcon
                  name={VegaIconNames.STAR}
                  className="text-vega-yellow-400"
                />{' '}
                Maker fees played
              </Pill>
            </dd>
          </dl>
          <StatSectionSeparator />
          <dl>
            <dt className="text-muted text-sm">Last 5 game results</dt>
            <dd className="flex gap-1">
              {new Array(4).fill(null).map((_, i) => {
                return (
                  <Pill key={i} className="text-sm">
                    {t('place', { count: i + 1, ordinal: true })}
                  </Pill>
                );
              })}
            </dd>
          </dl>
        </StatSection>
        <section>
          <div className="flex gap-4 lg:gap-8 mb-4 border-b border-default">
            <ToggleButton active={showGames} onClick={() => setShowGames(true)}>
              Games (7)
            </ToggleButton>
            <ToggleButton
              active={!showGames}
              onClick={() => setShowGames(false)}
            >
              Members (486)
            </ToggleButton>
          </div>
          {showGames ? <Games /> : <Members />}
        </section>
      </div>
    </div>
  );
};

const ToggleButton = ({
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) => {
  return (
    <button
      {...props}
      className={classNames('relative top-px uppercase border-b-2 py-4', {
        'text-muted border-transparent': !active,
        'border-vega-yellow': active,
      })}
    />
  );
};

const Games = () => {
  return (
    <Table
      columns={[
        { name: 'rank', displayName: 'Rank' },
        {
          name: 'date',
          displayName: 'Date',
          headerClassName: 'hidden md:block',
          className: 'hidden md:block',
        },
        { name: 'type', displayName: 'Type' },
        { name: 'amount', displayName: 'Amount earned' },
        {
          name: 'teams',
          displayName: 'No. of participants',
          headerClassName: 'hidden md:block',
          className: 'hidden md:block',
        },
        { name: 'status', displayName: 'Status' },
      ]}
      data={new Array(10).fill({
        rank: 1,
        date: getDateFormat().format(new Date()),
        type: (
          <span>
            PNL <span className="text-muted">(%)</span>
          </span>
        ),
        amount: (
          <span>
            10,000 $VEGA <span className="text-muted">(10%)</span>
          </span>
        ),
        teams: '1',
        status: (
          <span className="flex items-center gap-2">
            Live <Indicator variant={Intent.Success} />
          </span>
        ),
      })}
      noCollapse={true}
    />
  );
};

const TeamAvatar = () => {
  // TODO: add fallback avatars
  return (
    <div className="rounded-full w-14 h-14 lg:w-[112px] lg:h-[112px] bg-vega-clight-700 dark:bg-vega-cdark-700 shrink-0" />
  );
};

const Members = () => {
  return <div>TODO</div>;
};

const StatSection = ({ children }: { children: ReactNode }) => {
  return (
    <section className="flex flex-col lg:flex-row gap-2 lg:gap-8">
      {children}
    </section>
  );
};

const StatSectionSeparator = () => {
  return <div className="hidden lg:block border-r border-default" />;
};

const StatList = ({ children }: { children: ReactNode }) => {
  return <dl className="flex gap-4 lg:gap-8">{children}</dl>;
};

const Stat = ({
  value,
  label,
  tooltip,
}: {
  value: ReactNode;
  label: ReactNode;
  tooltip?: string;
}) => {
  return (
    <div>
      <dd className="text-3xl lg:text-4xl">{value}</dd>
      <dt className="text-sm text-muted">
        {tooltip ? (
          <Tooltip description={tooltip} underline={false}>
            <span className="flex items-center gap-2">
              {label}
              <VegaIcon name={VegaIconNames.INFO} size={12} />
            </span>
          </Tooltip>
        ) : (
          label
        )}
      </dt>
    </div>
  );
};

const JoinButton = ({ joined }: { joined: boolean }) => {
  const [open, setOpen] = useState(false);
  if (joined) {
    return (
      <div className="flex items-center gap-1">
        <Button intent={Intent.None} disabled={true}>
          <span className="flex items-center gap-2">
            Joined{' '}
            <span className="text-vega-green-600 dark:text-vega-green">
              <VegaIcon name={VegaIconNames.TICK} />
            </span>
          </span>
        </Button>
        <TradingDropdown
          onOpenChange={setOpen}
          open={open}
          trigger={
            <TradingDropdownTrigger>
              <button className="p-2">
                <VegaIcon name={VegaIconNames.KEBAB} size={24} />
              </button>
            </TradingDropdownTrigger>
          }
        >
          <TradingDropdownContent>
            <TradingDropdownItem>Leave team</TradingDropdownItem>
          </TradingDropdownContent>
        </TradingDropdown>
      </div>
    );
  }

  return <Button intent={Intent.Primary}>Join this team</Button>;
};

const PnlLabel = ({ value }: { value: string }) => {
  const isUp = new BigNumber(value).isGreaterThan(0);
  return (
    <span>
      PnL{' '}
      <span
        className={classNames({
          'text-market-green-550 dark:text-market-green': isUp,
          'text-market-red': !isUp,
        })}
      >
        {isUp ? '+' : ''}
        {value.toString()}%
      </span>
    </span>
  );
};
