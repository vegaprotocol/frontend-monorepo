import { fireEvent, render, screen } from '@testing-library/react';
import {
  VegaWalletContext,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import { VegaWalletConnectButton } from './vega-wallet-connect-button';

let props;

beforeEach(() => {
  props = {
    setConnectDialog: jest.fn(),
    setManageDialog: jest.fn(),
  };
});

const generateJsx = (context: VegaWalletContextShape, props) => {
  return (
    <VegaWalletContext.Provider value={context}>
      <VegaWalletConnectButton {...props} />
    </VegaWalletContext.Provider>
  );
};

test('Not connected', () => {
  render(generateJsx({ keypair: null } as VegaWalletContextShape, props));

  const button = screen.getByRole('button');
  expect(button).toHaveTextContent('Connect Vega wallet');
  fireEvent.click(button);
  expect(props.setConnectDialog).toHaveBeenCalledWith(true);
  expect(props.setManageDialog).not.toHaveBeenCalled();
});

test('Connected', () => {
  render(
    generateJsx(
      { keypair: { pub: '123456__123456' } } as VegaWalletContextShape,
      props
    )
  );

  expect(screen.getByText('Vega key:')).toBeInTheDocument();
  const button = screen.getByRole('button');
  expect(button).toHaveTextContent('123456\u2026123456');
  fireEvent.click(button);
  expect(props.setManageDialog).toHaveBeenCalledWith(true);
  expect(props.setConnectDialog).not.toHaveBeenCalled();
});
