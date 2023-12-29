import { TradingButton as Button, Intent } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react';

export const Team = () => {
  const [showGames, setShowGames] = useState(true);
  return (
    <div className="flex flex-col gap-4 lg:gap-6 container p-4 mx-auto">
      <header className="flex gap-2 lg:gap-4 pt-5 lg:pt-10">
        <div className="rounded-full w-14 h-14 lg:w-[112px] lg:h-[112px] bg-gray-500" />
        <div className="flex flex-col items-start gap-1 lg:gap-3">
          <h1 className="calt text-2xl lg:text-3xl xl:text-5xl">
            Vega Maxis long team name here
          </h1>
          <Button intent={Intent.Primary}>Join this team</Button>
        </div>
      </header>
      <section className="flex flex-col lg:flex-row gap-2 lg:gap-8">
        <StatList>
          <Stat value={24} label={'Rank'} />
          <Stat value={486} label={'Members'} />
          <Stat value={7} label={'Total games'} />
        </StatList>
        <div className="hidden lg:block border-r border-default" />
        <StatList>
          <Stat value={'4.76K'} label={'Total volume'} />
          <Stat value={'15.2K'} label={'Rewards paid'} />
          <Stat value={'10K'} label={'PnL'} />
        </StatList>
      </section>
      <section>
        <div className="flex gap-4 lg:gap-8 mb-4 border-b border-default">
          <ToggleButton active={showGames} onClick={() => setShowGames(true)}>
            Games (7)
          </ToggleButton>
          <ToggleButton active={!showGames} onClick={() => setShowGames(false)}>
            Members (486)
          </ToggleButton>
        </div>
        {showGames ? <Games /> : <Members />}
      </section>
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
  return <div>Games</div>;
};

const Members = () => {
  return <div>Members</div>;
};

const StatList = ({ children }: { children: ReactNode }) => {
  return <dl className="flex gap-4 lg:gap-8">{children}</dl>;
};

const Stat = ({ value, label }: { value: ReactNode; label: ReactNode }) => {
  return (
    <div>
      <dd className="text-3xl lg:text-4xl">{value}</dd>
      <dt className="text-muted">{label}</dt>
    </div>
  );
};
