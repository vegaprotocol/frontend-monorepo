import * as Types from '@vegaprotocol/types';
import type { WithdrawalFieldsFragment } from '@vegaprotocol/withdraws';
import { getReadyAndDelayed } from './use-incomplete-withdrawals';

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
    lifetimeLimit: '1',
    withdrawThreshold: '0',
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
    lifetimeLimit: '1',
    withdrawThreshold: '10',
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
    lifetimeLimit: '1',
    withdrawThreshold: '1000',
  },
};

const ts = (ms: number) => new Date(ms).toISOString();

// ready
const mockIncompleteW1: Withdrawal = {
  id: 'w1',
  status: Types.WithdrawalStatus.STATUS_OPEN,
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
  status: Types.WithdrawalStatus.STATUS_OPEN,
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
  status: Types.WithdrawalStatus.STATUS_OPEN,
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
  status: Types.WithdrawalStatus.STATUS_OPEN,
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
  status: Types.WithdrawalStatus.STATUS_OPEN,
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
  status: Types.WithdrawalStatus.STATUS_OPEN,
  amount: '1000',
  createdTimestamp: ts(10),
  pendingOnForeignChain: false,
  withdrawnTimestamp: ts(11),
  txHash: '0xcompleted',
  asset: HIGH_THRESHOLD_ASSET,
};

describe('getReadyAndDelayed', () => {
  const withdrawals = [
    mockIncompleteW1,
    mockIncompleteW2,
    mockIncompleteW3,
    mockIncompleteW4,
    mockIncompleteW5,
    mockCompleteW1,
  ];
  const delays = new Map([[1, BigInt(1)]]);
  let now: jest.SpyInstance<number, []>;

  beforeAll(() => {
    now = jest.spyOn(Date, 'now').mockImplementation(() => 5000);
  });

  afterAll(() => {
    jest.resetAllMocks();
    now.mockRestore();
  });

  it('returns a collection of ready to complete withdrawals', async () => {
    const { ready } = getReadyAndDelayed(withdrawals, delays);
    expect(ready).toHaveLength(3);
    expect(ready.map((w) => w.data.id)).toContain(mockIncompleteW1.id);
    expect(ready.map((w) => w.data.id)).toContain(mockIncompleteW2.id);
    expect(ready.map((w) => w.data.id)).toContain(mockIncompleteW3.id);
  });

  it('returns a collection of delayed withdrawals', async () => {
    const { delayed } = getReadyAndDelayed(withdrawals, delays);
    expect(delayed).toHaveLength(2);
    expect(delayed.map((w) => w.data.id)).toContain(mockIncompleteW4.id);
    expect(delayed.map((w) => w.data.id)).toContain(mockIncompleteW5.id);
  });
});
