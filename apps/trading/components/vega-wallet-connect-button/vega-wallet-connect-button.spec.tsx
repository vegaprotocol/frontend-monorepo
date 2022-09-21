import { fireEvent, render, screen } from '@testing-library/react';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import type { VegaWalletConnectButtonProps } from './vega-wallet-connect-button';
import { VegaWalletConnectButton } from './vega-wallet-connect-button';
import { truncateByChars } from '@vegaprotocol/react-helpers';

let props: VegaWalletConnectButtonProps;

beforeEach(() => {
  props = {
    setConnectDialog: jest.fn(),
  };
});

const generateJsx = (
  context: VegaWalletContextShape,
  props: VegaWalletConnectButtonProps
) => {
  return (
    <VegaWalletContext.Provider value={context}>
      <VegaWalletConnectButton {...props} />
    </VegaWalletContext.Provider>
  );
};

it('Not connected', () => {
  render(generateJsx({ pubKey: null } as VegaWalletContextShape, props));

  const button = screen.getByRole('button');
  expect(button).toHaveTextContent('Connect Vega wallet');
  fireEvent.click(button);
  expect(props.setConnectDialog).toHaveBeenCalledWith(true);
});

it('Connected', () => {
  const pubKey = { publicKey: '123456__123456', name: 'test' };
  render(
    generateJsx(
      { pubKey: pubKey.publicKey, pubKeys: [pubKey] } as VegaWalletContextShape,
      props
    )
  );

  const button = screen.getByRole('button');
  expect(button).toHaveTextContent(truncateByChars(pubKey.publicKey));
  fireEvent.click(button);
  expect(props.setConnectDialog).not.toHaveBeenCalled();
});
