import * as Types from '@vegaprotocol/types';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';
import BigNumber from 'bignumber.js';
import * as web3 from '@vegaprotocol/web3';
import { renderHook, waitFor } from '@testing-library/react';
import { useIncompleteWithdrawals } from './use-ready-to-complete-withdrawals-toast';
import { MockedProvider } from '@apollo/client/testing';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

jest.mock('@vegaprotocol/web3', () => {
  return {
    ...jest.requireActual('@vegaprotocol/web3'),
    useGetWithdrawThreshold: jest.fn(),
    useGetWithdrawDelay: jest.fn(),
  };
});
jest.mock('@vegaprotocol/wallet-react');

type Asset = WithdrawalFieldsFragment['asset'];
type Withdrawal = WithdrawalFieldsFragment;

const NO_THRESHOLD_ASSET: Asset = {
  __typename: 'Asset',
  id: 'NO_THRESHOLD_ASSET',
  name: 'NO_THRESHOLD_ASSET',
  symbol: 'NTA',
  decimals: 1,
  status: Types.AssetStatus.STATUS_ENABLED,
  quantum: '1',
  source: {
    __typename: 'ERC20',
    contractAddress: '0xnta',
    chainId: '1',
  },
};

const LOW_THRESHOLD_ASSET: Asset = {
  __typename: 'Asset',
  id: 'LOW_THRESHOLD_ASSET',
  name: 'LOW_THRESHOLD_ASSET',
  symbol: 'LTA',
  decimals: 1,
  status: Types.AssetStatus.STATUS_ENABLED,
  quantum: '1',
  source: {
    __typename: 'ERC20',
    contractAddress: '0xlta',
    chainId: '1',
  },
};

const HIGH_THRESHOLD_ASSET: Asset = {
  __typename: 'Asset',
  id: 'HIGH_THRESHOLD_ASSET',
  name: 'HIGH_THRESHOLD_ASSET',
  symbol: 'HTA',
  decimals: 1,
  status: Types.AssetStatus.STATUS_ENABLED,
  quantum: '1',
  source: {
    __typename: 'ERC20',
    contractAddress: '0xhta',
    chainId: '1',
  },
};

const NOW = 5000;
const DELAY = { value: 1, ts: 5000 };
const THRESHOLDS = [
  { address: 'builtin', chainId: 1, value: new BigNumber(Infinity), ts: 5000 },
  { address: '0xnta', chainId: 1, value: new BigNumber(Infinity), ts: 5000 },
  { address: '0xlta', chainId: 1, value: new BigNumber(10), ts: 5000 },
  { address: '0xhta', chainId: 1, value: new BigNumber(1000), ts: 5000 },
];

const ts = (ms: number) => new Date(ms).toISOString();

// ready
const mockIncompleteW1: Withdrawal = {
  id: 'w1',
  status: Types.WithdrawalStatus.STATUS_FINALIZED,
  amount: '10000000000',
  createdTimestamp: ts(10),
  pendingOnForeignChain: true,
  withdrawnTimestamp: null,
  txHash: null,
  asset: NO_THRESHOLD_ASSET,
};

// delay (10 + 1000 < 5000), ready
const mockIncompleteW2: Withdrawal = {
  id: 'w2',
  status: Types.WithdrawalStatus.STATUS_FINALIZED,
  amount: '100',
  createdTimestamp: ts(10),
  pendingOnForeignChain: true,
  withdrawnTimestamp: null,
  txHash: null,
  asset: LOW_THRESHOLD_ASSET,
};
// delay (4500 + 1000 > 5000), below threshold, ready
const mockIncompleteW3: Withdrawal = {
  id: 'w3',
  status: Types.WithdrawalStatus.STATUS_FINALIZED,
  amount: '1000',
  createdTimestamp: ts(4500),
  pendingOnForeignChain: true,
  withdrawnTimestamp: null,
  txHash: null,
  asset: HIGH_THRESHOLD_ASSET,
};
// delay (5000 + 1000 > 5000), delayed
const mockIncompleteW4: Withdrawal = {
  id: 'w4',
  status: Types.WithdrawalStatus.STATUS_FINALIZED,
  amount: '10000',
  createdTimestamp: ts(5000),
  pendingOnForeignChain: true,
  withdrawnTimestamp: null,
  txHash: null,
  asset: HIGH_THRESHOLD_ASSET,
};
// delay (4001 + 1000 > 5000), delayed
const mockIncompleteW5: Withdrawal = {
  id: 'w5',
  status: Types.WithdrawalStatus.STATUS_FINALIZED,
  amount: '100000',
  createdTimestamp: ts(4001),
  pendingOnForeignChain: true,
  withdrawnTimestamp: null,
  txHash: null,
  asset: HIGH_THRESHOLD_ASSET,
};
// completed
const mockCompleteW1: Withdrawal = {
  id: 'cw1',
  status: Types.WithdrawalStatus.STATUS_FINALIZED,
  amount: '1000',
  createdTimestamp: ts(10),
  pendingOnForeignChain: false,
  withdrawnTimestamp: ts(11),
  txHash: '0xcompleted',
  asset: HIGH_THRESHOLD_ASSET,
};

jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: () => ({
    data: [
      mockIncompleteW1,
      mockIncompleteW2,
      mockIncompleteW3,
      mockIncompleteW4,
      mockIncompleteW5,
      mockCompleteW1,
    ],
  }),
}));

describe('useIncompleteWithdrawals', () => {
  let DATE_NOW: jest.SpyInstance<number, []>;
  beforeAll(() => {
    // mocks Date.now() to always return the same point in time.
    DATE_NOW = jest.spyOn(Date, 'now').mockImplementation(() => NOW);

    (useVegaWallet as jest.Mock).mockReturnValue({
      pubKey: '0xpubkey',
      isReadOnly: false,
    });

    (web3.useGetWithdrawThreshold as jest.Mock).mockImplementation(
      () => (asset: web3.AssetData) => {
        if (asset) {
          const th = THRESHOLDS.find(
            (t) => t.address === asset.contractAddress
          );
          if (th) return Promise.resolve(th.value);
        }
        return Promise.resolve(Infinity);
      }
    );
    (web3.useGetWithdrawDelay as jest.Mock).mockImplementation(() => () => {
      return Promise.resolve(DELAY.value);
    });
  });
  afterAll(() => {
    jest.resetAllMocks();
    DATE_NOW.mockRestore();
  });

  it('returns a collection of ready to complete withdrawals', async () => {
    const { result } = renderHook(() => useIncompleteWithdrawals(), {
      wrapper: MockedProvider,
    });
    await waitFor(async () => {
      const { ready } = result.current;
      expect(ready).toHaveLength(3);
      expect(ready.map((w) => w.data.id)).toContain(mockIncompleteW1.id);
      expect(ready.map((w) => w.data.id)).toContain(mockIncompleteW2.id);
      expect(ready.map((w) => w.data.id)).toContain(mockIncompleteW3.id);
    });
  });

  it('returns a collection of delayed withdrawals', async () => {
    const { result } = renderHook(() => useIncompleteWithdrawals(), {
      wrapper: MockedProvider,
    });
    await waitFor(async () => {
      const { delayed } = result.current;
      expect(delayed).toHaveLength(2);
      expect(delayed.map((w) => w.data.id)).toContain(mockIncompleteW4.id);
      expect(delayed.map((w) => w.data.id)).toContain(mockIncompleteW5.id);
    });
  });
});
