/* eslint-disable jest/no-conditional-expect */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { VegaWalletContext } from '../context';
import type { VegaWalletContextShape } from '../context';
import type { VegaManageDialogProps } from '.';
import { VegaManageDialog } from '.';
import { truncateByChars } from '@vegaprotocol/utils';

let props: VegaManageDialogProps;
let context: Partial<VegaWalletContextShape>;
let pubKey1;
let pubKey2;

beforeEach(() => {
  pubKey1 = { publicKey: '111111__111111', name: 'test key 1' };
  pubKey2 = { publicKey: '222222__222222', name: 'test key 2' };
  props = {
    dialogOpen: true,
    setDialogOpen: jest.fn(),
  };
  context = {
    pubKey: pubKey1.publicKey,
    pubKeys: [pubKey1, pubKey2],
    selectPubKey: jest.fn(),
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
  expect(list.children).toHaveLength(context.pubKeys!.length);

  // eslint-disable-next-line
  context.pubKeys!.forEach((pk, i) => {
    const keyListItem = within(screen.getByTestId(`key-${pk.publicKey}`));
    expect(
      keyListItem.getByText(truncateByChars(pk.publicKey))
    ).toBeInTheDocument();
    expect(keyListItem.getByText('Copy')).toBeInTheDocument();

    // Active
    // eslint-disable-next-line
    if (pk.publicKey === context.pubKey!) {
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
      expect(context.selectPubKey).toHaveBeenCalledWith(pk.publicKey);
    }
  });

  // Disconnect
  fireEvent.click(screen.getByTestId('disconnect'));
  expect(context.disconnect).toHaveBeenCalled();
  expect(props.setDialogOpen).toHaveBeenCalledWith(false);
});
