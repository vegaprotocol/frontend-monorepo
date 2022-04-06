import { fireEvent, render, screen, within } from '@testing-library/react';
import { VegaWalletContext } from './context';
import type { VegaWalletContextShape, VegaKeyExtended } from './context';
import type { VegaManageDialogProps } from './manage-dialog';
import { VegaManageDialog } from './manage-dialog';

let props: VegaManageDialogProps;
let context: Partial<VegaWalletContextShape>;
let keypair1: VegaKeyExtended;
let keypair2: VegaKeyExtended;

beforeEach(() => {
  keypair1 = {
    pub: '111111__111111',
    name: 'keypair1-name',
  } as VegaKeyExtended;
  keypair2 = {
    pub: '222222__222222',
    name: 'keypair2-name',
  } as VegaKeyExtended;
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

test('Shows list of available keys and can disconnect', () => {
  render(generateJsx(context as VegaWalletContextShape, props));

  const list = screen.getByTestId('keypair-list');
  expect(list).toBeInTheDocument();
  // eslint-disable-next-line
  expect(list.children).toHaveLength(context.keypairs!.length);

  // eslint-disable-next-line
  context.keypairs!.forEach((kp, i) => {
    const keyListItem = within(screen.getByTestId(`key-${kp.pub}`));
    expect(
      keyListItem.getByText(kp.name, { selector: 'h2' })
    ).toBeInTheDocument();
    expect(keyListItem.getByText('Copy')).toBeInTheDocument();

    // Active
    // eslint-disable-next-line
    if (kp.pub === context.keypair!.pub) {
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
      expect(context.selectPublicKey).toHaveBeenCalledWith(kp.pub);
    }
  });

  // Disconnect
  fireEvent.click(screen.getByTestId('disconnect'));
  expect(context.disconnect).toHaveBeenCalled();
  expect(props.setDialogOpen).toHaveBeenCalledWith(false);
});
