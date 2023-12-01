import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OrderEditDialog } from './order-edit-dialog';
import { limitOrder } from '../mocks';

describe('OrderEditDialog', () => {
  it('must be warned (pre-submit) if the input price has too many digits after the decimal place for the market', async () => {
    // 7003-MORD-013
    render(
      <OrderEditDialog
        order={limitOrder}
        onChange={jest.fn()}
        isOpen={true}
        onSubmit={jest.fn()}
      />
    );
    const editOrder = await screen.findByTestId('edit-order');
    const limitPrice = within(editOrder).getByLabelText('Price');
    await userEvent.type(limitPrice, '0.111111');
    const submitButton = within(editOrder).getByRole('button', {
      name: 'Update',
    });
    await userEvent.click(submitButton);
    const inputErrorText = within(editOrder).getByTestId('input-error-text');
    expect(inputErrorText).toHaveTextContent(
      'Price accepts up to 1 decimal places'
    );
  });
});
