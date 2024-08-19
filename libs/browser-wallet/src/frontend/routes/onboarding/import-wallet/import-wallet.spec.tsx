import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { locators as pageLocators } from '@/components/pages/page';
import { JsonRPCProvider } from '@/contexts/json-rpc/json-rpc-provider';
import { mockClient } from '@/test-helpers/mock-client';
import { mockStorage } from '@/test-helpers/mock-storage';

import { FULL_ROUTES } from '../../route-names';
import { ImportWallet, locators } from '.';

const validRecoveryPhrase =
  'solid length discover gun swear nose artwork unfair vacuum canvas push hybrid owner wasp arrest mixed oak miss cage scatter tree harsh critic believe';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

const renderComponent = () => {
  render(
    <JsonRPCProvider>
      <MemoryRouter>
        <ImportWallet />
      </MemoryRouter>
    </JsonRPCProvider>
  );
};

describe('ImportWallet', () => {
  beforeEach(() => {
    mockStorage();
  });
  it('renders back button, description, input and submit button', () => {
    // 1101-ONBD-026 I can see an explanation of what I am being asked to do
    mockClient();
    renderComponent();
    expect(
      screen.getByTestId(locators.importMnemonicDescription)
    ).toHaveTextContent(
      "Enter or paste in your Vega wallet's recovery phrase."
    );
    expect(
      screen.getByTestId(locators.importMnemonicDescription)
    ).toBeVisible();
    expect(screen.getByTestId(locators.importMnemonic)).toBeInTheDocument();
    expect(screen.getByTestId(locators.importMnemonic)).toHaveFocus();
    expect(screen.getByTestId(locators.importMnemonicSubmit)).toHaveTextContent(
      'Import wallet'
    );
    expect(screen.getByTestId(pageLocators.basePageBack)).toHaveAttribute(
      'href',
      FULL_ROUTES.createWallet
    );
  });

  it('renders loading state while wallet is being imported', async () => {
    // 1101-ONBD-032 - I can see the button is disabled and a loading state after submitting
    mockClient();
    renderComponent();

    expect(
      screen.getByTestId(locators.importMnemonicDescription)
    ).toHaveTextContent(
      "Enter or paste in your Vega wallet's recovery phrase."
    );
    fireEvent.change(screen.getByTestId(locators.importMnemonic), {
      target: {
        value:
          'solid length discover gun swear nose artwork unfair vacuum canvas push hybrid owner wasp arrest mixed oak miss cage scatter tree harsh critic believe',
      },
    });
    fireEvent.click(screen.getByTestId(locators.importMnemonicSubmit));

    await waitFor(() =>
      expect(
        screen.getByTestId(locators.importMnemonicSubmit)
      ).toHaveTextContent('Importing…')
    );
    expect(screen.getByTestId(locators.importMnemonicSubmit)).toBeDisabled();
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('after successfully importing a wallet it redirects to wallets page', async () => {
    mockClient();
    renderComponent();

    expect(
      screen.getByTestId(locators.importMnemonicDescription)
    ).toHaveTextContent(
      "Enter or paste in your Vega wallet's recovery phrase."
    );
    fireEvent.change(screen.getByTestId(locators.importMnemonic), {
      target: {
        value:
          'solid length discover gun swear nose artwork unfair vacuum canvas push hybrid owner wasp arrest mixed oak miss cage scatter tree harsh critic believe',
      },
    });
    fireEvent.click(screen.getByTestId(locators.importMnemonicSubmit));

    // Needs longer timeout as this shows for 1 full second
    await waitFor(
      () =>
        expect(mockedUsedNavigate).toHaveBeenCalledWith(FULL_ROUTES.wallets),
      { timeout: 1200 }
    );
  });

  it('requires mnemonic should be 24 words', async () => {
    // 1101-ONBD-029 I can not hit submit until I have entered 24 words (and given feedback that I haven't met the min number of words)
    mockClient();
    const twentyThreeWords =
      'one two three four five six seven eight nine ten eleven twelve thirteen fouteen fifteen sixteen seventeen eighteen ninteen twenty twenty-one twenty-two twenty-three';
    renderComponent();
    fireEvent.change(screen.getByTestId(locators.importMnemonic), {
      target: { value: twentyThreeWords },
    });
    const errorMessage = await screen.findByText(
      'Recovery phrase must be 12, 15, 18, 21 or 24 words'
    );
    expect(errorMessage).toBeVisible();
    expect(screen.getByTestId(locators.importMnemonicSubmit)).toBeDisabled();
    fireEvent.change(screen.getByTestId(locators.importMnemonic), {
      target: { value: twentyThreeWords + ' twentyfour' },
    });

    await waitFor(() =>
      expect(
        screen.getByTestId(locators.importMnemonicSubmit)
      ).not.toBeDisabled()
    );
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('renders error message if recovery phrase is invalid', async () => {
    // 1101-ONBD-030 If I submit a recovery phrase I am given feedback if the words are invalid i.e. no wallet found with that recovery phrase (and I can try again)
    // eslint-disable-next-line @typescript-eslint/ban-types
    const listeners: Function[] = [];
    // @ts-ignore
    global.browser = {
      runtime: {
        connect: () => ({
          postMessage: (message: any) => {
            listeners[0]({
              jsonrpc: '2.0',
              error: {
                message: 'Invalid recovery phrase',
                // TODO correct error code
                code: -32_602,
              },
              id: message.id,
            });
          },
          onmessage: (...arguments_: any[]) => {
            console.log('om', arguments_);
          },
          onMessage: {
            addListener: (function_: any) => {
              listeners.push(function_);
            },
          },
          onDisconnect: {
            addListener: (function_: any) => {},
          },
        }),
      },
    };
    renderComponent();
    fireEvent.change(screen.getByTestId(locators.importMnemonic), {
      target: {
        value: validRecoveryPhrase.slice(0, -1),
      },
    });
    fireEvent.click(screen.getByTestId(locators.importMnemonicSubmit));
    await screen.findByText('Error: Invalid recovery phrase');
    expect(screen.getByTestId(locators.importMnemonicSubmit)).toBeDisabled();
  });
});
