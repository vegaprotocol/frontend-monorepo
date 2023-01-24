import { render } from '@testing-library/react';
import { RichSelect, Select, Option } from './select';

describe('Select', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Select />);
    expect(baseElement).toBeTruthy();
  });
});

describe('RichSelect', () => {
  it('should render select element with placeholder when no value is pre-selected', async () => {
    const { findByTestId } = render(
      <RichSelect placeholder={'Select'}>
        <Option value={'1'}>1</Option>
        <Option value={'2'}>2</Option>
      </RichSelect>
    );
    const btn = (await findByTestId(
      'rich-select-trigger'
    )) as HTMLButtonElement;
    expect(btn.textContent).toEqual('Select');
  });

  it('should render select element with pre-selected value', async () => {
    const { findByTestId } = render(
      <RichSelect placeholder={'Select'} value={'1'}>
        <Option value={'1'}>1</Option>
        <Option value={'2'}>2</Option>
      </RichSelect>
    );
    const btn = (await findByTestId(
      'rich-select-trigger'
    )) as HTMLButtonElement;
    expect(btn.textContent).toEqual('1');
  });
});
