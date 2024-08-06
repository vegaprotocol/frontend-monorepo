import { render, screen } from '@testing-library/react';

import { DataTable, locators } from './data-table';

describe('DataTable', () => {
  it('renders the correct number of rows', () => {
    const items: [string, string][] = [
      ['key1', 'value1'],
      ['key2', 'value2'],
      ['key3', 'value3'],
    ];
    render(<DataTable items={items} />);

    const rows = screen.getAllByTestId(locators.dataRow);
    expect(rows).toHaveLength(items.length);
  });

  it('renders the key-value pairs correctly', () => {
    const items: [string, string][] = [
      ['key1', 'value1'],
      ['key2', 'value2'],
      ['key3', 'value3'],
    ];
    render(<DataTable items={items} />);

    for (const [index, [key, value]] of items.entries()) {
      const keyElement = screen.getAllByTestId(locators.dataKey)[index];
      const valueElement = screen.getAllByTestId(locators.dataValue)[index];

      expect(keyElement.textContent).toBe(key);
      expect(valueElement.textContent).toBe(value);
    }
  });
});
