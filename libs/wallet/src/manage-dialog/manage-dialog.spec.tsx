/* eslint-disable jest/no-conditional-expect */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { VegaWalletContext } from '../context';
import type { VegaWalletContextShape } from '../context';
import type { VegaManageDialogProps } from '.';
import { VegaManageDialog } from '.';
import { truncateByChars } from '@vegaprotocol/react-helpers';

let props: VegaManageDialogProps;
let context: Partial<VegaWalletContextShape>;
let keypair1;
let keypair2;

beforeEach(() => {
  keypair1 = '111111__111111';
  keypair2 = '222222__222222';
  props = {
    dialogOpen: true,
    setDialogOpen: jest.fn(),
  };
  context = {
    keypair: keypair1,
    keypairs: [keypair1, keypair2],
    selectPublicKey: jest.fn(),
    disconnect: jest.fn(),
  };
});

const generateJsx = (
  context: VegaWalletContextShape,
  props: VegaManageDialogProps
) => {
  return (
    <VegaWalletContext.Provider value={context}>
      <VegaManageDialog {...props} />
    </VegaWalletContext.Provider>
  );
};

it('Shows list of available keys and can disconnect', () => {
  render(generateJsx(context as VegaWalletContextShape, props));

  const list = screen.getByTestId('keypair-list');
  expect(list).toBeInTheDocument();
  // eslint-disable-next-line
  expect(list.children).toHaveLength(context.keypairs!.length);

  // eslint-disable-next-line
  context.keypairs!.forEach((kp, i) => {
    const keyListItem = within(screen.getByTestId(`key-${kp}`));
    expect(
      keyListItem.getByText(`${kp} ${truncateByChars(kp)}`)
    ).toBeInTheDocument();
    expect(keyListItem.getByText('Copy')).toBeInTheDocument();

    // Active
    // eslint-disable-next-line
    if (kp === context.keypair!) {
      expect(keyListItem.getByTestId('selected-key')).toBeInTheDocument();
      expect(
        keyListItem.queryByTestId('select-keypair-button')
      ).not.toBeInTheDocument();
    }
    // Inactive
    else {
      const selectButton = keyListItem.getByTestId('select-keypair-button');
      expect(selectButton).toBeInTheDocument();
      expect(keyListItem.queryByTestId('selected-key')).not.toBeInTheDocument();
      fireEvent.click(selectButton);
      expect(context.selectPublicKey).toHaveBeenCalledWith(kp);
    }
  });

  // Disconnect
  fireEvent.click(screen.getByTestId('disconnect'));
  expect(context.disconnect).toHaveBeenCalled();
  expect(props.setDialogOpen).toHaveBeenCalledWith(false);
});
