import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  VegaWalletContext,
  VegaWalletContextShape,
  VegaKeyExtended,
} from './context';
import { VegaManageDialog, VegaManageDialogProps } from './manage-dialog';

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

  // Shows which key is active
  expect(screen.getByTestId(`key-${keypair1.pub}`)).toHaveTextContent(
    `${keypair1.name} (Active)`
  );
  expect(screen.getByTestId(`key-${keypair2.pub}`)).toHaveTextContent(
    keypair2.name
  );

  const keyListItem = within(screen.getByTestId(`key-${keypair2.pub}`));
  fireEvent.click(keyListItem.getAllByRole('button')[0]);
  expect(context.selectPublicKey).toHaveBeenCalledWith(keypair2.pub);
  expect(keyListItem.getByText('Copy')).toBeInTheDocument();

  // Disconnect
  fireEvent.click(screen.getByTestId('disconnect'));
  expect(context.disconnect).toHaveBeenCalled();
  expect(props.setDialogOpen).toHaveBeenCalledWith(false);
});
