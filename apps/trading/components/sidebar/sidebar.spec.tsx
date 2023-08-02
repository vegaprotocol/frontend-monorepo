import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sidebar,
  SidebarButton,
  SidebarContent,
  ViewType,
  useSidebar,
} from './sidebar';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VegaIconNames } from '@vegaprotocol/ui-toolkit';

jest.mock('../node-health', () => ({
  NodeHealthContainer: () => <span data-testid="node-health" />,
}));

jest.mock('@vegaprotocol/accounts', () => ({
  TransferContainer: () => <div data-testid="transfer" />,
}));

jest.mock('@vegaprotocol/deposits', () => ({
  DepositContainer: () => <div data-testid="deposit" />,
}));

jest.mock('../settings', () => ({
  Settings: () => <div data-testid="settings" />,
}));

jest.mock('../welcome-dialog', () => ({
  GetStarted: () => <div data-testid="get-started" />,
}));

describe('Sidebar', () => {
  it.each(['/markets/all', '/portfolio'])(
    'does not render ticket and info',
    (path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Sidebar />
        </MemoryRouter>
      );

      expect(screen.getByTestId(ViewType.ViewAs)).toBeInTheDocument();
      expect(screen.getByTestId(ViewType.Settings)).toBeInTheDocument();
      expect(screen.getByTestId(ViewType.Transfer)).toBeInTheDocument();
      expect(screen.getByTestId(ViewType.Deposit)).toBeInTheDocument();
      expect(screen.getByTestId(ViewType.Withdraw)).toBeInTheDocument();
      expect(screen.getByTestId('node-health')).toBeInTheDocument();

      // no order or info sidebars
      expect(screen.queryByTestId(ViewType.Order)).not.toBeInTheDocument();
      expect(screen.queryByTestId(ViewType.Info)).not.toBeInTheDocument();
    }
  );

  it('renders ticket and info on market pages', () => {
    render(
      <MemoryRouter initialEntries={['/markets/ABC']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByTestId(ViewType.ViewAs)).toBeInTheDocument();
    expect(screen.getByTestId(ViewType.Settings)).toBeInTheDocument();
    expect(screen.getByTestId(ViewType.Transfer)).toBeInTheDocument();
    expect(screen.getByTestId(ViewType.Deposit)).toBeInTheDocument();
    expect(screen.getByTestId(ViewType.Withdraw)).toBeInTheDocument();
    expect(screen.getByTestId('node-health')).toBeInTheDocument();

    // order and info sidebars are shown
    expect(screen.getByTestId(ViewType.Order)).toBeInTheDocument();
    expect(screen.getByTestId(ViewType.Info)).toBeInTheDocument();
  });

  it('renders selected state', async () => {
    render(
      <MemoryRouter initialEntries={['/markets/ABC']}>
        <Sidebar />
      </MemoryRouter>
    );

    const settingsButton = screen.getByTestId(ViewType.Settings);
    const orderButton = screen.getByTestId(ViewType.Order);

    // select settings first
    await userEvent.click(settingsButton);
    expect(settingsButton).toHaveClass('bg-vega-yellow text-black');

    // switch to order
    await userEvent.click(orderButton);
    expect(settingsButton).not.toHaveClass('bg-vega-yellow text-black');
    expect(orderButton).toHaveClass('bg-vega-yellow text-black');

    // close order
    await userEvent.click(orderButton);
    expect(orderButton).not.toHaveClass('bg-vega-yellow text-black');
  });
});

describe('SidebarContent', () => {
  it('renders the correct content', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/markets/ABC']}>
        <Routes>
          <Route path="/markets/:marketId" element={<SidebarContent />} />
        </Routes>
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();

    act(() => {
      useSidebar.setState({ view: { type: ViewType.Transfer } });
    });

    expect(screen.getByTestId('transfer')).toBeInTheDocument();

    act(() => {
      useSidebar.setState({ view: { type: ViewType.Deposit } });
    });

    expect(screen.getByTestId('deposit')).toBeInTheDocument();
  });

  it('closes sidebar if market id is required but not present', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/portfolio']}>
        <Routes>
          <Route path="/portfolio" element={<SidebarContent />} />
        </Routes>
      </MemoryRouter>
    );

    act(() => {
      useSidebar.setState({ view: { type: ViewType.Order } });
    });

    expect(container).toBeEmptyDOMElement();

    act(() => {
      useSidebar.setState({ view: { type: ViewType.Settings } });
    });

    expect(screen.getByTestId('settings')).toBeInTheDocument();

    act(() => {
      useSidebar.setState({ view: { type: ViewType.Info } });
    });

    expect(container).toBeEmptyDOMElement();
  });
});

describe('SidebarButton', () => {
  it.each([ViewType.Info, ViewType.Deposit, ViewType.ViewAs])(
    'runs given action when clicked regardless of requested view (%s)',
    async (view) => {
      const actionFn = jest.fn();
      render(
        <SidebarButton
          icon={VegaIconNames.INFO}
          tooltip="INFO"
          action={actionFn}
          view={view}
        />
      );

      const btn = screen.getByTestId(view);
      await userEvent.click(btn);

      expect(actionFn).toBeCalled();
    }
  );
});
