import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PartyLink from './party-link';
import { MockedProvider } from '@apollo/client/testing';
import { ExplorerNodeNamesDocument } from '../../../routes/validators/__generated__/NodeNames';
import { act } from 'react-dom/test-utils';
const zeroes =
  '0000000000000000000000000000000000000000000000000000000000000000';
const mocks = [
  {
    request: {
      query: ExplorerNodeNamesDocument,
    },
    result: {
      data: {
        nodesConnection: {
          edges: [
            {
              node: {
                id: '1',
                name: 'Validator Node',
                pubkey:
                  '13464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6e',
                tmPubkey: 'tmPubkey1',
                ethereumAddress: '0x123456789',
              },
            },
            {
              node: {
                id: '2',
                name: 'Node 2',
                pubkey: 'pubkey2',
                tmPubkey: 'tmPubkey2',
                ethereumAddress: '0xabcdef123',
              },
            },
          ],
        },
      },
    },
  },
];

describe('PartyLink', () => {
  it('renders Network for 000.000 party', () => {
    const screen = render(
      <MockedProvider>
        <PartyLink id={zeroes} />
      </MockedProvider>
    );
    expect(screen.getByText('Network')).toBeInTheDocument();
  });

  it('renders Network for network party', () => {
    const screen = render(
      <MockedProvider>
        <PartyLink id="network" />
      </MockedProvider>
    );
    expect(screen.getByText('Network')).toBeInTheDocument();
  });

  it('renders ID with no link for invalid party', () => {
    const screen = render(
      <MockedProvider>
        <PartyLink id="this-party-is-not-valid" />
      </MockedProvider>
    );
    expect(screen.getByTestId('invalid-party')).toBeInTheDocument();
  });

  it('if the key is a validator, render their name instead', async () => {
    const screen = render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <PartyLink id="13464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6e" />
        </MemoryRouter>
      </MockedProvider>
    );

    // Wait for hook to update with mock data
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    await expect(screen.getByText('Validator Node')).toBeInTheDocument();
  });

  it('links a valid party to the party page', () => {
    const aValidParty =
      '13464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6e';

    const screen = render(
      <MockedProvider>
        <MemoryRouter>
          <PartyLink id={aValidParty} />
        </MemoryRouter>
      </MockedProvider>
    );

    const el = screen.getByText(aValidParty);
    expect(el).toBeInTheDocument();
    // The text should be a link that points to the party's page
    expect(el.parentElement?.tagName).toEqual('A');
    expect(el.parentElement?.getAttribute('href')).toContain(aValidParty);
  });
});
