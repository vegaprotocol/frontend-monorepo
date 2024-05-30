import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../routes/blocks/tendermint-blocks-response';
import type { components } from '../../../types/explorer';

import {
  TxDetailsTransfer,
  getTypeLabelForTransfer,
} from './details/tx-transfer';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ExplorerTransferStatusDocument } from './details/transfer/__generated__/Transfer';
import { ExplorerEpochForBlockDocument } from '../links/block-link/__generated__/EpochByBlock';

type Transfer = components['schemas']['commandsv1Transfer'];

describe('TX: Transfer: getLabelForTransfer', () => {
  it('renders reward top up label if the TO party is 000', () => {
    const mock: Transfer = {
      to: '0000000000000000000000000000000000000000000000000000000000000000',
      recurring: {
        dispatchStrategy: {},
      },
    };

    expect(getTypeLabelForTransfer(mock)).toEqual('Reward transfer');
  });

  it('renders reward top up label if the TO party is network', () => {
    const mock = {
      to: 'network',
      recurring: {
        dispatchStrategy: {},
      },
    };

    expect(getTypeLabelForTransfer(mock)).toEqual('Reward transfer');
  });

  it('renders recurring label if the tx has a recurring property', () => {
    const mock: Transfer = {
      to: '0000000000000000000000000000000000000000000000000000000000000001',
      recurring: {
        startEpoch: '0',
      },
    };

    expect(getTypeLabelForTransfer(mock)).toEqual('Recurring transfer');
  });

  it('renders one off label if the tx has a oneOff property', () => {
    const mock: Transfer = {
      to: '0000000000000000000000000000000000000000000000000000000000000001',
      oneOff: {
        deliverOn: '0',
      },
    };

    expect(getTypeLabelForTransfer(mock)).toEqual('Transfer');
  });

  it('renders one off label otherwise', () => {
    const mock: Transfer = {
      to: '0000000000000000000000000000000000000000000000000000000000000001',
    };

    expect(getTypeLabelForTransfer(mock)).toEqual('Transfer');
  });
});

jest.mock('../links');
jest.mock('../size-in-asset/size-in-asset');
jest.mock('../epoch-overview/epoch');

const MockTransferDetails: MockedResponse = {
  request: {
    query: ExplorerTransferStatusDocument,
    variables: {
      id: '51f3bab5eb2637651012507a64d497790a734248792c16e5cf36df8984074fbd',
    },
  },
  result: {
    data: {
      transfer: {
        transfer: {
          status: 'STATUS_ACCEPTED',
        },
        fees: [
          {
            amount: '0',
            epoch: 0,
          },
        ],
      },
    },
  },
};

const MockExplorerEpochForBlock: MockedResponse = {
  request: {
    query: ExplorerEpochForBlockDocument,
    variables: {
      block: '100',
    },
  },
  result: {
    data: {
      epoch: {
        id: '100',
        timestamps: {
          start: '2022-03-24T11:03:40.014303953Z',
          end: '2022-03-24T11:03:40.014303953Z',
          lastBlock: '1',
        },
      },
    },
  },
};

describe('TxDetailsTransfer', () => {
  const mockBlockData = {
    result: {
      block: {
        header: {
          height: '123',
        },
      },
    },
  };

  const mockTxData: Partial<BlockExplorerTransactionResult> = {
    hash: 'test',
    submitter:
      'e1943eea46fed576cf2be42972f3c5515ad3d0ac7ac013f56677c12a53a1b3ed',
    block: '100',
    command: {
      nonce: '5188810881378065222',
      blockHeight: '14951513',
      transfer: {
        fromAccountType: 'ACCOUNT_TYPE_GENERAL',
        to: '78432a2808f20b18a46ccc6a917bdc4d63c2b9e7007f777bdcab5a9f462c5ba6',
        toAccountType: 'ACCOUNT_TYPE_GENERAL',
        asset:
          'dd20590509d30d20bdbbe64dc1090c1140c7690121a9b9940bc66f62dfa2e599',
        amount: '4800000000',
        reference: '',
        oneOff: {
          deliverOn: '0',
        },
      },
    },
    signature: {
      version: '1',
      algo: 'vega/ed25519',
      value:
        '610c2e196a7d4fed4413b9e82af267b1ff3e30e943df3a3d28096fd60604d430d752fbaf6dd4f84d496be78885bb6118f40560bff7832c06bd7a3d67b718b700',
    },
  };

  it('renders basic transfer details', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[MockTransferDetails, MockExplorerEpochForBlock]}>
        <MemoryRouter>
          <TxDetailsTransfer
            txData={mockTxData as BlockExplorerTransactionResult}
            pubKey={mockTxData.command.submitter}
            blockData={mockBlockData as TendermintBlocksResponse}
          />
        </MemoryRouter>
      </MockedProvider>
    );

    const id = getByTestId('id');
    expect(id.children[0].textContent).toEqual('Transfer ID');
    expect(id.children[1].textContent).toEqual(
      '51f3bab5eb2637651012507a64d497790a734248792c16e5cf36df8984074fbd'
    );

    const type = getByTestId('type');
    expect(type.children[1].textContent).toEqual('Transfer');

    const from = getByTestId('from');
    expect(from.children[1].textContent).toEqual(mockTxData.submitter);

    const to = getByTestId('to');
    expect(to.children[1].textContent).toEqual(mockTxData.command.transfer.to);
  });
});
