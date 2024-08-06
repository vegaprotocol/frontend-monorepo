import { render, screen } from '@testing-library/react';

import genericLocators from '../../../locators';
import { RawTransaction } from './raw-transaction';

describe('RawTransaction', () => {
  it('renders page header, transaction type, hostname and key', () => {
    /* 1105-TRAN-011 For transactions that are not orders or withdraw / transfers, there is a standard template with the minimum information required i.e. 
    -- [ ] Raw JSON details
    
        1105-TRAN-012 I can copy the raw json to my clipboard
    */
    render(<RawTransaction transaction={{ foo: 123 } as any} />);
    expect(screen.getByTestId(genericLocators.codeWindow)).toBeVisible();
    expect(screen.getByTestId(genericLocators.copyWithCheck)).toBeVisible();
    expect(
      screen.getByTestId(genericLocators.codeWindowContent)
    ).toHaveTextContent('{ "foo": 123 }');
  });
});
