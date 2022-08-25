import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { InputSetter } from './index';

describe('InputSetter Component', () => {
  it('should show the correct value and visibility based on props', async () => {
    const value = 'Hello';
    const isInputToggled = true;
    const { getByRole } = await render(
      <InputSetter
        id="input-order-size-market"
        type="number"
        className="w-full"
        value={value}
        isInputToggled={isInputToggled}
        onChange={() => false}
      />
    );
    const input = getByRole('spinbutton');
    const btn = getByRole('button');
    expect(input).toHaveAttribute('value', value);
    expect(btn).toBeTruthy();
  });

  it('should get toggled when button is clicked', async () => {
    const value = 'Hello';
    const isInputToggled = true;
    const { getByRole } = await render(
      <InputSetter
        id="input-order-size-market"
        type="number"
        className="w-full"
        value={value}
        isInputToggled={isInputToggled}
        onChange={() => false}
      />
    );
    const btn = getByRole('button');
    fireEvent.click(btn);
    await waitFor(() => getByRole('button'));
    expect(getByRole('button')).toHaveTextContent(value);
  });

  it('should get toggled when enter button is pressed', async () => {
    const value = 'Hello';
    const isInputToggled = true;
    const { getByRole } = await render(
      <InputSetter
        id="input-order-size-market"
        name="input-order-size-market"
        type="number"
        className="w-full"
        value={value}
        isInputToggled={isInputToggled}
        onChange={() => false}
      />
    );
    fireEvent.keyDown(getByRole('spinbutton'), {
      key: 'Enter',
    });
    await waitFor(() => getByRole('button'));
    expect(getByRole('button')).toHaveTextContent(value);
  });
});
