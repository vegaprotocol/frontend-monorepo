import { render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';

import { CompactNumber } from './number';

describe('CompactNumber', () => {
  const short: [BigNumber, string, number | 'infer'][] = [
    [new BigNumber(Infinity), '∞', 'infer'],
    [new BigNumber(-Infinity), '-∞', 'infer'],
    [new BigNumber(0), '0', 'infer'],
    [new BigNumber(1), '1', 'infer'],
    [new BigNumber(100), '100', 'infer'],
    [new BigNumber(100.456601), '100.456601', 'infer'],
    [new BigNumber(1_000), '1,000', 'infer'],
    [new BigNumber(999_999), '999,999', 'infer'],
    [new BigNumber(1_000_000), '1M', 'infer'],
    [new BigNumber(100_000_000), '100M', 'infer'],
    [new BigNumber(1_000_000_000), '1B', 'infer'],
    [new BigNumber(1_000_000_000_000), '1T', 'infer'],
    [new BigNumber(3.23e12), '3.23T', 2],
    [new BigNumber(3.23e12), '3.23000T', 5],
    [new BigNumber(3.23e24), '3.23000 \u00d7 1024', 5], // \u00d7 is times 'x'
    [new BigNumber(1.579208923731619e59), '1.57921 \u00d7 1059', 5],
  ];
  it.each(short)(
    'compacts %d to %p (decimal places: %p)',
    (input, output, decimals) => {
      render(<CompactNumber number={input} decimals={decimals} />);
      expect(screen.getByTestId('compact-number')).toHaveTextContent(output);
    }
  );

  const long: [BigNumber, string, number | 'infer'][] = [
    [new BigNumber(Infinity), '∞', 'infer'],
    [new BigNumber(-Infinity), '-∞', 'infer'],
    [new BigNumber(0), '0', 'infer'],
    [new BigNumber(1), '1', 'infer'],
    [new BigNumber(100), '100', 'infer'],
    [new BigNumber(100.456601), '100.456601', 'infer'],
    [new BigNumber(1_000), '1,000', 'infer'],
    [new BigNumber(999_999), '999,999', 'infer'],
    [new BigNumber(1_000_000), '1 million', 'infer'],
    [new BigNumber(100_000_000), '100 million', 'infer'],
    [new BigNumber(1_000_000_000), '1 billion', 'infer'],
    [new BigNumber(1_000_000_000_000), '1 trillion', 'infer'],
    [new BigNumber(3.23e12), '3.23 trillion', 2],
    [new BigNumber(3.23e12), '3.23000 trillion', 5],
    [new BigNumber(3.23e24), '3.23000 \u00d7 1024', 5], // \u00d7 is times 'x'
    [new BigNumber(1.579208923731619e59), '1.57921 \u00d7 1059', 5], // \u00d7 is times 'x'
  ];
  it.each(long)(
    'compacts %d to %p (decimal places: %p)',
    (input, output, decimals) => {
      render(
        <CompactNumber
          number={input}
          decimals={decimals}
          compactDisplay="long"
        />
      );
      expect(screen.getByTestId('compact-number')).toHaveTextContent(output);
    }
  );
});
