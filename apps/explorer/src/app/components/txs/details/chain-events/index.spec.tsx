import { render } from '@testing-library/react';
import type { BlockExplorerTransactionResult } from '../../../../routes/types/block-explorer-response';

import { ChainEvent } from '.';

const baseMock: Partial<BlockExplorerTransactionResult> = {
  block: '1',
  index: 1,
  hash: '123',
  submitter: '123',
  type: '1',
  code: 1,
  cursor: '1',
};

jest.mock('./tx-builtin-deposit', () => ({
  TxDetailsChainEventBuiltinDeposit: () => (
    <span>TxDetailsChainEventBuiltinDeposit</span>
  ),
}));
jest.mock('./tx-builtin-withdrawal', () => ({
  TxDetailsChainEventBuiltinWithdrawal: () => (
    <span>TxDetailsChainEventBuiltinWithdrawal</span>
  ),
}));
jest.mock('./tx-erc20-deposit', () => ({
  TxDetailsChainEventDeposit: () => <span>TxDetailsChainEventDeposit</span>,
}));
jest.mock('./tx-erc20-withdrawal', () => ({
  TxDetailsChainEventWithdrawal: () => (
    <span>TxDetailsChainEventWithdrawal</span>
  ),
}));
jest.mock('./tx-erc20-asset-list', () => ({
  TxDetailsChainEventErc20AssetList: () => (
    <span>TxDetailsChainEventErc20AssetList</span>
  ),
}));
jest.mock('./tx-erc20-asset-delist', () => ({
  TxDetailsChainEventErc20AssetDelist: () => (
    <span>TxDetailsChainEventErc20AssetDelist</span>
  ),
}));
jest.mock('./tx-erc20-asset-limits-updated', () => ({
  TxDetailsChainEventErc20AssetLimitsUpdated: () => (
    <span>TxDetailsChainEventErc20LimitsUpdated</span>
  ),
}));
jest.mock('./tx-erc20-bridge-pause', () => ({
  TxDetailsChainEventErc20BridgePause: () => (
    <span>TxDetailsChainEventErc20BridgeEvent</span>
  ),
}));
jest.mock('./tx-multisig-signer', () => ({
  TxDetailsChainMultisigSigner: () => <span>TxDetailsChainMultisigSigner</span>,
}));
jest.mock('./tx-multisig-threshold', () => ({
  TxDetailsChainMultisigThreshold: () => (
    <span>TxDetailsChainMultisigThreshold</span>
  ),
}));
jest.mock('./tx-stake-deposit', () => ({
  TxDetailsChainEventStakeDeposit: () => (
    <span>TxDetailsChainStakeDeposit</span>
  ),
}));
jest.mock('./tx-stake-remove', () => ({
  TxDetailsChainEventStakeRemove: () => <span>TxDetailsChainStakeRemove</span>,
}));
jest.mock('./tx-stake-totalsupply', () => ({
  TxDetailsChainEventStakeTotalSupply: () => (
    <span>TxDetailsChainStakeTotalSupply</span>
  ),
}));

describe('Chain Event: Chain Event selects the right component for the event', () => {
  it('Returns a Built In Deposit event for a built in deposit', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          builtin: {
            deposit: {
              amount: '',
              partyId: '',
              vegaAssetId: '',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(screen.getByText('TxDetailsChainEventBuiltinDeposit')).toBeVisible();
  });

  it('Returns a Built In Deposit event for a built in withdrawal', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          builtin: {
            withdrawal: {
              amount: '',
              partyId: '',
              vegaAssetId: '',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(
      screen.getByText('TxDetailsChainEventBuiltinWithdrawal')
    ).toBeVisible();
  });

  it('Returns a Built In Deposit event for an ERC20 deposit', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          erc20: {
            deposit: {
              amount: '',
              targetPartyId: '',
              sourceEthereumAddress: '',
              vegaAssetId: '',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(screen.getByText('TxDetailsChainEventDeposit')).toBeVisible();
  });

  it('Returns a Built In Deposit event for an ERC20 withdrawal', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          erc20: {
            withdrawal: {
              referenceNonce: '',
              targetEthereumAddress: '',
              vegaAssetId: '',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(screen.getByText('TxDetailsChainEventWithdrawal')).toBeVisible();
  });

  it('Returns a Asset List event view for a list', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          erc20: {
            assetList: {
              assetSource: '',
              vegaAssetId: '',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(screen.getByText('TxDetailsChainEventErc20AssetList')).toBeVisible();
  });

  it('Returns a Asset Delist event view for a delist', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          erc20: {
            assetDelist: {
              vegaAssetId: '',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(
      screen.getByText('TxDetailsChainEventErc20AssetDelist')
    ).toBeVisible();
  });

  it('Returns a Asset Limits Update event view for a update', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          erc20: {
            assetLimitsUpdated: {
              lifetimeLimits: '100',
              withdrawThreshold: '100',
              vegaAssetId: '',
              sourceEthereumAddress: '0x000',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(
      screen.getByText('TxDetailsChainEventErc20LimitsUpdated')
    ).toBeVisible();
  });

  it('Returns a Bridge Pause event view when a pause event happens', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          erc20: {
            bridgeStopped: true,
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(
      screen.getByText('TxDetailsChainEventErc20BridgeEvent')
    ).toBeVisible();
  });

  it('Returns a Bridge Pause event view when a resume event happens', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          erc20: {
            bridgeResumed: true,
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(
      screen.getByText('TxDetailsChainEventErc20BridgeEvent')
    ).toBeVisible();
  });

  it('Returns a multsig signer view when a multisig signer is added', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          erc20Multisig: {
            signerAdded: {
              blockTime: '100',
              newSigner: '0x000',
              nonce: '123',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(screen.getByText('TxDetailsChainMultisigSigner')).toBeVisible();
  });

  it('Returns a multsig signer view when a multisig signer is removed', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          erc20Multisig: {
            signerRemoved: {
              blockTime: '100',
              oldSigner: '0x000',
              nonce: '123',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(screen.getByText('TxDetailsChainMultisigSigner')).toBeVisible();
  });

  it('Returns a multsig signer view when a multisig threshold change event occurs', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          erc20Multisig: {
            thresholdSet: {
              blockTime: '100',
              newThreshold: 100,
              nonce: '123',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(screen.getByText('TxDetailsChainMultisigThreshold')).toBeVisible();
  });

  it('Returns a stake deposit view when a stake arrives', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          stakingEvent: {
            stakeDeposited: {
              blockTime: '100',
              amount: '100',
              vegaPublicKey: '12345',
              ethereumAddress: '0x123',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(screen.getByText('TxDetailsChainStakeDeposit')).toBeVisible();
  });

  it('Returns a stake removed view when a stake goes', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          stakingEvent: {
            stakeRemoved: {
              blockTime: '100',
              amount: '100',
              vegaPublicKey: '12345',
              ethereumAddress: '0x123',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(screen.getByText('TxDetailsChainStakeRemove')).toBeVisible();
  });

  it('Returns a stake total supply view when the supply of the staking asset changes', () => {
    const commandMock: Partial<BlockExplorerTransactionResult> = {
      command: {
        chainEvent: {
          stakingEvent: {
            totalSupply: {
              totalSupply: '12345',
              tokenAddress: '0x123',
            },
          },
        },
      },
    };

    const mock = Object.assign(
      {},
      baseMock,
      commandMock
    ) as BlockExplorerTransactionResult;

    const screen = render(<ChainEvent txData={mock} />);
    expect(screen.getByText('TxDetailsChainStakeTotalSupply')).toBeVisible();
  });
});
