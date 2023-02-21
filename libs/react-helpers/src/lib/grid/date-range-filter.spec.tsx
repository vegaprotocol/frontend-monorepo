import { render, screen, waitFor, act } from '@testing-library/react';
import type { DateRangeFilterProps } from './date-range-filter';
import { DateRangeFilter } from './date-range-filter';

const commonProps = {
  filterChangedCallback: jest.fn(),
};

describe('DateRangeFilter', () => {
  it('should be properly rendered', async () => {
    const defaultRangeFilter = {
      start: '2023-02-14T13:53:01+01:00',
      end: '2023-02-21T13:53:01+01:00',
    };
    const displayStartValue = '2023-02-14T12:53:01.000';
    const displayEndValue = '2023-02-21T12:53:01.000';
    let queryContainer: HTMLElement;
    await act(() => {
      const { container } = render(
        <DateRangeFilter
          {...(commonProps as unknown as DateRangeFilterProps)}
          defaultRangeFilter={defaultRangeFilter}
        />
      );
      queryContainer = container;
    });

    await waitFor(() => {
      expect(queryContainer).toBeVisible();

      expect(screen.getByLabelText('Start')).toBeInTheDocument();
      expect(screen.getByLabelText('End')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(queryContainer.querySelector('input[name="start"]')).toHaveValue(
        displayStartValue
      );
      expect(queryContainer.querySelector('input[name="end"]')).toHaveValue(
        displayEndValue
      );
    });
    expect(commonProps.filterChangedCallback).toHaveBeenCalled();
  });
});
