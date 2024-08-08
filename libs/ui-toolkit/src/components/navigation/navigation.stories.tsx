import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { MemoryRouter, Route, Routes, useMatch } from 'react-router-dom';
import {
  Button,
  ExternalLink,
  Icon,
  NavigationBreakpoint,
  ThemeSwitcher,
} from '..';
import {
  Navigation,
  NavigationContent,
  NavigationItem,
  NavigationLink,
  NavigationList,
  NavigationTrigger,
} from './navigation';

export default {
  title: 'Navigation',
  component: Navigation,
} as ComponentMeta<typeof Navigation>;

const Template: ComponentStory<typeof Navigation> = ({
  children,
  ...props
}) => {
  const nav = <Navigation {...props}>{children}</Navigation>;
  return (
    <MemoryRouter>
      <div className="h-[300px]">
        {nav}
        <div className="mt-2">
          <Routes>
            <Route path="transactions" element={<h1>Transactions</h1>} />
            <Route path="blocks" element={<h1>Blocks</h1>} />
            <Route path="markets/all" element={<h1>All markets</h1>} />
          </Routes>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quis
            pariatur a nemo quos sed! Voluptas itaque voluptate dolores minima.
            Iste laudantium perspiciatis accusamus facere eius repudiandae sit
            odio saepe nisi.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea facere
            ab at incidunt numquam nemo natus eos iure, iste tenetur illo
            dolores, commodi magni quam dolor totam quae velit eaque.
          </p>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quaerat
            minus perspiciatis quas temporibus odit? Enim ipsam nisi amet
            molestias magnam esse blanditiis aperiam sapiente quaerat. Veniam
            unde magnam exercitationem distinctio.
          </p>
        </div>
      </div>
    </MemoryRouter>
  );
};

export const Default = Template.bind({});
Default.args = {
  appName: '',
};

const ExplorerNav = () => {
  const isOnMarkets = useMatch('markets/*');

  return (
    <>
      <NavigationList>
        <NavigationItem hide={[NavigationBreakpoint.Small]}>
          {/* <NetworkSwitcher currentNetwork={Networks.CUSTOM} /> */}
          <Button size="xs">Network Switcher</Button>
        </NavigationItem>
      </NavigationList>
      <NavigationList
        hide={[NavigationBreakpoint.Narrow, NavigationBreakpoint.Small]}
      >
        <NavigationItem>
          <NavigationLink to="transactions">Transactions</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink to="blocks">Blocks</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationTrigger isActive={Boolean(isOnMarkets)}>
            Markets
          </NavigationTrigger>
          <NavigationContent>
            <NavigationList>
              <NavigationItem>
                <NavigationLink to="markets/all">All markets</NavigationLink>
              </NavigationItem>
              <NavigationItem>
                <NavigationLink to="markets/proposed">
                  Proposed markets
                </NavigationLink>
              </NavigationItem>
              <NavigationItem>
                <NavigationLink to="markets/failed">
                  Failed markets
                </NavigationLink>
              </NavigationItem>
            </NavigationList>
          </NavigationContent>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink to="validators">Validators</NavigationLink>
        </NavigationItem>
      </NavigationList>
    </>
  );
};

export const Explorer = Template.bind({});
Explorer.args = {
  appName: 'Explorer',
  theme: 'system',
  children: <ExplorerNav />,
  actions: (
    <>
      <ThemeSwitcher />
      {/* JUST A PLACEHOLDER */}
      <div className="border rounded px-2 py-1 text-xs font-alpha w-60 flex items-center gap-1">
        <Icon name="search" size={3} className="text-gs-200" />
        <input
          className="w-full bg-transparent outline-none"
          placeholder="Enter block number or transaction hash"
        />
      </div>
    </>
  ),
};

const ConsoleNav = () => {
  return (
    <>
      <NavigationList>
        <NavigationItem>
          <Button size="xs">Network Switcher</Button>
        </NavigationItem>
      </NavigationList>
      <NavigationList
        hide={[NavigationBreakpoint.Narrow, NavigationBreakpoint.Small]}
      >
        <NavigationItem>
          <NavigationLink to="markets">Markets</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink to="trading">Trading</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink to="portfolio">Portfolio</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <ExternalLink>
            <span className="flex items-center gap-2">
              <span>Governance</span> <Icon name="arrow-top-right" size={3} />
            </span>
          </ExternalLink>
        </NavigationItem>
      </NavigationList>
    </>
  );
};

export const Console = Template.bind({});
Console.args = {
  appName: 'Console',
  theme: 'system',
  children: <ConsoleNav />,
  breakpoints: [478, 770],
  actions: <ThemeSwitcher />,
};

const GovernanceNav = () => {
  const isOnToken = useMatch('token/*');
  return (
    <>
      <NavigationList>
        <NavigationItem hide={[NavigationBreakpoint.Small]}>
          <Button size="xs">Network Switcher</Button>
        </NavigationItem>
      </NavigationList>
      <NavigationList
        hide={[NavigationBreakpoint.Narrow, NavigationBreakpoint.Small]}
      >
        <NavigationItem>
          <NavigationLink to="proposals">Proposals</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink to="validators">Validators</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink to="rewards">Rewards</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationTrigger isActive={Boolean(isOnToken)}>
            Token
          </NavigationTrigger>
          <NavigationContent>
            <NavigationList>
              <NavigationItem>
                <NavigationLink to="token/index">Token</NavigationLink>
              </NavigationItem>
              <NavigationItem>
                <NavigationLink to="token/tranches">
                  Supply & Vesting
                </NavigationLink>
              </NavigationItem>
              <NavigationItem>
                <NavigationLink to="token/withdraw">Withdraw</NavigationLink>
              </NavigationItem>
              <NavigationItem>
                <NavigationLink to="token/redeem">Redeem</NavigationLink>
              </NavigationItem>
              <NavigationItem>
                <NavigationLink to="token/associate">Associate</NavigationLink>
              </NavigationItem>
              <NavigationItem>
                <NavigationLink to="token/disassociate">
                  Disassociate
                </NavigationLink>
              </NavigationItem>
            </NavigationList>
          </NavigationContent>
        </NavigationItem>
      </NavigationList>
    </>
  );
};

export const Governance = Template.bind({});
Governance.args = {
  appName: 'Governance',
  theme: 'dark',
  children: <GovernanceNav />,
  actions: (
    <Button size="sm">
      <span className="flex items-center gap-2">
        <span>Connect</span> <Icon name="arrow-right" size={3} />
      </span>
    </Button>
  ),
};
