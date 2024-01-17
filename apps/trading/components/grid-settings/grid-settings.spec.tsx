import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GridSettings } from './grid-settings';
import '@testing-library/jest-dom';

jest.mock('../../lib/use-t', () => ({
  useT: () => jest.fn().mockReturnValue('Reset Columns'),
}));

describe('GridSettings', () => {
  it('calls updateGridStore with correct arguments on button click', async () => {
    const mockUpdateGridStore = jest.fn();
    const { getByText } = render(
      <GridSettings updateGridStore={mockUpdateGridStore} />
    );

    await userEvent.click(getByText('Reset Columns'));

    expect(mockUpdateGridStore).toHaveBeenCalledWith({
      columnState: undefined,
      filterModel: undefined,
    });
  });
});
