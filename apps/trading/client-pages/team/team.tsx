import {
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
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

export const Team = () => {
  const [showGames, setShowGames] = useState(true);
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 w-full h-[40%] -z-10 bg-[40%_0px] bg-[length:1440px] bg-no-repeat bg-local bg-[url(/cover.png)]">
        <div className="absolute top-o left-0 w-full h-full bg-gradient-to-t from-white dark:from-black to-transparent from-20% to-60%" />
      </div>
      <div className="flex flex-col gap-4 lg:gap-6 container p-4 mx-auto">
        <header className="flex gap-2 lg:gap-4 pt-5 lg:pt-10">
          <div className="rounded-full w-14 h-14 lg:w-[112px] lg:h-[112px] bg-vega-clight-700 dark:bg-vega-cdark-700 shrink-0" />
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
              value={'10K'}
              label={<PnlLabel value={'-100'} />}
              tooltip={'PnL description'}
            />
          </StatList>
        </StatSection>
        <StatSection>
          <dl>
            <dt className="text-muted text-sm">Favorite game</dt>
            <dd>TODO:</dd>
          </dl>
          <StatSectionSeparator />
          <dl>
            <dt className="text-muted text-sm">Last 5 game results</dt>
            <dd className="flex gap-1">
              {new Array(4).fill(null).map((_, i) => {
                return <Pill key={i}>{i}Th</Pill>;
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
    <div>
      <Table />
    </div>
  );
};

const Members = () => {
  return (
    <div>
      <Table />
    </div>
  );
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

const Table = () => {
  return (
    <table className="w-full border-separate border rounded-md border-spacing-0 border-vega-clight-500 dark:border-vega-cdark-500 bg-gradient-to-b from-vega-clight-800 dark:from-vega-cdark-800 to-transparent bg-white dark:bg-vega-cdark-900 text-sm text-left">
      <thead>
        <tr>
          <Th>Rank</Th>
          <Th>Date</Th>
          <Th>Type</Th>
          <Th>Amount earned</Th>
          <Th>No. of participating teams</Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody>
        {new Array(10).fill(
          <tr>
            <Td>5</Td>
            <Td>01.05-07.2023</Td>
            <Td>PNL (%)</Td>
            <Td>10,000 $VEGA (10%)</Td>
            <Td>200</Td>
            <Td className="flex items-center gap-2">
              Live <Indicator variant={Intent.Success} />
            </Td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

const Th = (props: ThHTMLAttributes<HTMLTableHeaderCellElement>) => {
  return <th {...props} className="px-5 py-3" />;
};

const Td = (props: TdHTMLAttributes<HTMLTableCellElement>) => {
  return <td {...props} className={classNames('px-5 py-3', props.className)} />;
};

const JoinButton = ({ joined }: { joined: boolean }) => {
  const [open, setOpen] = useState(false);
  if (joined) {
    return (
      <div className="flex items-center gap-3">
        <Button intent={Intent.None} disabled={true}>
          <span className="flex items-center gap-2">
            Joined{' '}
            <span className="text-vega-green">
              <VegaIcon name={VegaIconNames.TICK} />
            </span>
          </span>
        </Button>
        <TradingDropdown
          onOpenChange={setOpen}
          open={open}
          trigger={
            <TradingDropdownTrigger>
              <button>
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
