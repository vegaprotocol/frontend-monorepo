import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartMenu } from './chart-container';
import {
  useCandlesChartSettingsStore,
  DEFAULT_CHART_SETTINGS,
} from './use-candles-chart-settings';
import { Overlay, Study, overlayLabels, studyLabels } from 'pennant';

describe('ChartMenu', () => {
  const openDropdown = async () => {
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Indicators',
      })
    );
  };

  beforeEach(() => {
    // clear store each time to avoid conditional testing of defaults
    useCandlesChartSettingsStore.setState({ overlays: [], studies: [] });
  });

  it.each(Object.values(Overlay))('can set %s overlay', async (overlay) => {
    render(<ChartMenu />);

    await openDropdown();

    const menu = within(await screen.findByRole('menu'));

    await userEvent.click(menu.getByText(overlayLabels[overlay as Overlay]));

    // re-open the dropdown
    await openDropdown();

    expect(screen.getByText(overlayLabels[overlay as Overlay])).toHaveAttribute(
      'data-state',
      'checked'
    );
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
    useCandlesChartSettingsStore.setState(DEFAULT_CHART_SETTINGS);

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
