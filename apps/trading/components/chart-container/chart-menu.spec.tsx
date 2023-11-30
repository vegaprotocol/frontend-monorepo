import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartMenu } from './chart-menu';
import {
  useChartSettingsStore,
  DEFAULT_CHART_SETTINGS,
} from './use-chart-settings';
import { Overlay, Study, overlayLabels, studyLabels } from 'pennant';
import { useEnvironment } from '@vegaprotocol/environment';

describe('ChartMenu', () => {
  it('doesnt show trading view option if library path undefined', () => {
    useEnvironment.setState({ CHARTING_LIBRARY_PATH: undefined });

    render(<ChartMenu />);

    expect(
      screen.queryByRole('button', { name: 'pennant' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'tradingview' })
    ).not.toBeInTheDocument();
  });

  it('shows trading view option if library path is set', async () => {
    useEnvironment.setState({ CHARTING_LIBRARY_PATH: 'dummy' });

    useChartSettingsStore.setState({
      chartlib: 'tradingview',
    });

    render(<ChartMenu />);

    await userEvent.click(screen.getByRole('button', { name: 'tradingview' }));

    const pennantOption = screen.getByRole('menuitemradio', {
      name: 'Pennant',
    });
    const tradingviewOption = screen.getByRole('menuitemradio', {
      name: 'Tradingview',
    });

    expect(pennantOption).toBeInTheDocument();
    expect(tradingviewOption).toBeInTheDocument();

    await userEvent.click(pennantOption);

    expect(useChartSettingsStore.getState().chartlib).toEqual('pennant');
  });

  describe('tradingview', () => {
    beforeEach(() => {
      useEnvironment.setState({ CHARTING_LIBRARY_PATH: 'dummy-path' });

      // clear store each time to avoid conditional testing of defaults
      useChartSettingsStore.setState({
        chartlib: 'tradingview',
      });
    });

    it('only shows chartlib dropdown', () => {
      render(<ChartMenu />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent('tradingview');
    });
  });

  describe('pennant', () => {
    const openDropdown = async () => {
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Indicators',
        })
      );
    };

    beforeEach(() => {
      // clear store each time to avoid conditional testing of defaults
      useChartSettingsStore.setState({
        chartlib: 'pennant',
        overlays: [],
        studies: [],
      });
    });

    it.each(Object.values(Overlay))('can set %s overlay', async (overlay) => {
      render(<ChartMenu />);

      await openDropdown();

      const menu = within(await screen.findByRole('menu'));

      await userEvent.click(menu.getByText(overlayLabels[overlay as Overlay]));

      // re-open the dropdown
      await openDropdown();

      expect(
        screen.getByText(overlayLabels[overlay as Overlay])
      ).toHaveAttribute('data-state', 'checked');
    });

    it.each(Object.values(Study))('can set %s study', async (study) => {
      render(<ChartMenu />);

      await openDropdown();

      const menu = within(await screen.findByRole('menu'));

      await userEvent.click(menu.getByText(studyLabels[study as Study]));

      // re-open the dropdown
      await openDropdown();

      expect(screen.getByText(studyLabels[study as Study])).toHaveAttribute(
        'data-state',
        'checked'
      );
    });

    it('should render with the correct default studies and overlays', async () => {
      useChartSettingsStore.setState({
        ...DEFAULT_CHART_SETTINGS,
        chartlib: 'pennant',
      });

      render(<ChartMenu />);

      await userEvent.click(
        screen.getByRole('button', {
          name: 'Indicators',
        })
      );
      const menu = within(await screen.findByRole('menu'));

      expect(menu.getByText(studyLabels.volume)).toHaveAttribute(
        'data-state',
        'checked'
      );
      expect(menu.getByText(studyLabels.macd)).toHaveAttribute(
        'data-state',
        'checked'
      );
      expect(menu.getByText(overlayLabels.movingAverage)).toHaveAttribute(
        'data-state',
        'checked'
      );
    });
  });
});
