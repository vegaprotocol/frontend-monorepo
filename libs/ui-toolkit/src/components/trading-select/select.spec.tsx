import { render } from '@testing-library/react';
import { TradingRichSelect, TradingSelect, TradingOption } from './select';

describe('Select', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TradingSelect />);
    expect(baseElement).toBeTruthy();
  });
});

describe('RichSelect', () => {
  it('should render select element with placeholder when no value is pre-selected', async () => {
    const { findByTestId } = render(
      <TradingRichSelect placeholder={'Select'}>
        <TradingOption value={'1'}>1</TradingOption>
        <TradingOption value={'2'}>2</TradingOption>
      </TradingRichSelect>
    );
    const btn = (await findByTestId(
      'rich-select-trigger'
    )) as HTMLButtonElement;
    expect(btn.textContent).toEqual('Select');
  });

  it('should render select element with pre-selected value', async () => {
    const { findByTestId } = render(
      <TradingRichSelect placeholder={'Select'} value={'1'}>
        <TradingOption value={'1'}>1</TradingOption>
        <TradingOption value={'2'}>2</TradingOption>
      </TradingRichSelect>
    );
    const btn = (await findByTestId(
      'rich-select-trigger'
    )) as HTMLButtonElement;
    expect(btn.textContent).toEqual('1');
  });
});
