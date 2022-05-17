const ethers = require('ethers');
const BigNumber = require('bignumber.js');
const uniq = require('lodash/uniq');
const fs = require('fs');

const MAX_ATTEMPTS = 5;

const CONFIG = [
  {
    env: 'mainnet',
    contract: '0x23d1bfe8fa50a167816fbd79d7932577c06011f4',
    provider: 'https://mainnet.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
    startBlock: 12834524,
  },
  {
    env: 'testnet',
    contract: '0xe2deBB240b43EDfEBc9c38B67c0894B9A92Bf07c',
    provider: 'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
    startBlock: 11340808,
  },
  {
    env: 'stagnet1',
    contract: '0xfCe6eB272D3d4146A96bC28de71212b327F575fa',
    provider: 'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
    startBlock: 11259488,
  },
  {
    env: 'stagnet2',
    contract: '0x9F10cBeEf03A564Fb914c2010c0Cd55E9BB11406',
    provider: 'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
    startBlock: 11790009,
  },
  {
    env: 'devnet',
    contract: '0xd1216AAb948f5FC706Df73df6d71c64CcaA8550a',
    provider: 'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
    startBlock: 11790003,
  },
];

const vestingAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token_v1_address',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token_v2_address',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: 'old_addresses',
        type: 'address[]',
      },
      {
        internalType: 'address[]',
        name: 'new_addresses',
        type: 'address[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'new_controller',
        type: 'address',
      },
    ],
    name: 'Controller_Set',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Issuer_Permitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
    ],
    name: 'Issuer_Revoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'vega_public_key',
        type: 'bytes32',
      },
    ],
    name: 'Stake_Deposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'vega_public_key',
        type: 'bytes32',
      },
    ],
    name: 'Stake_Removed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'vega_public_key',
        type: 'bytes32',
      },
    ],
    name: 'Stake_Transferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint8',
        name: 'tranche_id',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Tranche_Balance_Added',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint8',
        name: 'tranche_id',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Tranche_Balance_Removed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint8',
        name: 'tranche_id',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cliff_start',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'Tranche_Created',
    type: 'event',
  },
  {
    inputs: [],
    name: 'accuracy_scale',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'address_migration',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'tranche_id',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
    ],
    name: 'assisted_withdraw_from_tranche',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'controller',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cliff_start',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'create_tranche',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'default_tranche_id',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'tranche_id',
        type: 'uint8',
      },
    ],
    name: 'get_tranche_balance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'tranche_id',
        type: 'uint8',
      },
    ],
    name: 'get_vested_for_tranche',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'tranche_id',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'issue_into_tranche',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'tranche_id',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'move_into_tranche',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'permit_issuer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'permitted_issuance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'vega_public_key',
        type: 'bytes32',
      },
    ],
    name: 'remove_stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'issuer',
        type: 'address',
      },
    ],
    name: 'revoke_issuer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'new_controller',
        type: 'address',
      },
    ],
    name: 'set_controller',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'vega_public_key',
        type: 'bytes32',
      },
    ],
    name: 'stake_balance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'vega_public_key',
        type: 'bytes32',
      },
    ],
    name: 'stake_tokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'staking_token',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'total_locked',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'total_staked',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tranche_count',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    name: 'tranches',
    outputs: [
      {
        internalType: 'uint256',
        name: 'cliff_start',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'user_stats',
    outputs: [
      {
        internalType: 'uint256',
        name: 'total_in_all_tranches',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lien',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'user_total_all_tranches',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'v1_address',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'v1_migrated',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'v2_address',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'tranche_id',
        type: 'uint8',
      },
    ],
    name: 'withdraw_from_tranche',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

function addDecimal(value, decimals) {
  return value.dividedBy(Math.pow(10, decimals)).decimalPlaces(decimals);
}

function createUserTransactions(events, decimals) {
  return events.map((event) => {
    return {
      amount: addDecimal(
        new BigNumber(event.args?.amount.toString()),
        decimals
      ),
      user: event.args?.user,
      tranche_id: event.args?.tranche_id,
      tx: event.transactionHash,
    };
  });
}

function getUsersInTranche(
  balanceAddedEvents,
  balanceRemovedEvents,
  addresses,
  decimals
) {
  return addresses.map((address) => {
    const userDeposits = balanceAddedEvents.filter(
      (event) => event.args?.user === address
    );
    const userWithdraws = balanceRemovedEvents.filter(
      (event) => event.args?.user === address
    );
    const deposits = createUserTransactions(userDeposits, decimals);
    const withdrawals = createUserTransactions(userWithdraws, decimals);
    const total_tokens = deposits.reduce(
      (pre, cur) => pre.plus(cur.amount),
      new BigNumber(0)
    );
    const withdrawn_tokens = withdrawals.reduce(
      (pre, cur) => pre.plus(cur.amount),
      new BigNumber(0)
    );
    const remaining_tokens = total_tokens.minus(withdrawn_tokens);

    return {
      address,
      deposits,
      withdrawals,
      total_tokens,
      withdrawn_tokens,
      remaining_tokens,
    };
  });
}

function sumFromEvents(events, decimals) {
  const amounts = events.map((e) =>
    addDecimal(new BigNumber(e.args?.amount.toString()), decimals)
  );
  // Start with a 0 so if there are none there is no NaN
  return BigNumber.sum.apply(null, [new BigNumber(0), ...amounts]);
}

function getLockedAmount(totalAdded, cliffStart, trancheDuration) {
  let amount = new BigNumber(0);
  const ts = Math.round(new Date().getTime() / 1000);
  const tranche_progress = (ts - cliffStart) / trancheDuration;

  if (tranche_progress < 0) {
    amount = totalAdded;
  } else if (tranche_progress < 1) {
    amount = totalAdded.times(1 - tranche_progress);
  }

  return amount;
}

function createTransactions(events, decimals) {
  return events.map((event) => {
    return {
      amount: addDecimal(
        new BigNumber(event.args?.amount.toString()),
        decimals
      ),
      user: event.args?.user,
      tx: event.transactionHash,
    };
  });
}

function getTranchesFromHistory(
  createEvents,
  addEvents,
  removeEvents,
  decimals
) {
  return createEvents.map((event) => {
    const tranche_id = event.args?.tranche_id;
    const balanceAddedEvents = addEvents.filter(
      (e) =>
        e.event === 'Tranche_Balance_Added' && e.args?.tranche_id === tranche_id
    );
    const balanceRemovedEvents = removeEvents.filter(
      (e) =>
        e.event === 'Tranche_Balance_Removed' &&
        e.args?.tranche_id === tranche_id
    );

    //get tranche start and end dates
    const tranche_duration = event.args?.duration;
    const cliff_start = event.args?.cliff_start;
    const tranche_start = new Date(cliff_start.mul(1000).toNumber());
    const tranche_end = new Date(
      cliff_start.add(tranche_duration).mul(1000).toNumber()
    );

    // get added and removed values
    const total_added = sumFromEvents(balanceAddedEvents, decimals);
    const total_removed = sumFromEvents(balanceRemovedEvents, decimals);
    // get locked amount
    const locked_amount = getLockedAmount(
      total_added,
      cliff_start,
      tranche_duration
    );

    // get all deposits and withdrawals
    const deposits = createTransactions(balanceAddedEvents, decimals);
    const withdrawals = createTransactions(balanceRemovedEvents, decimals);

    // get all users
    const uniqueAddresses = uniq(
      balanceAddedEvents.map((event) => event.args?.user)
    );
    const users = getUsersInTranche(
      balanceAddedEvents,
      balanceRemovedEvents,
      uniqueAddresses,
      decimals
    );

    return {
      tranche_id: parseInt(tranche_id),
      tranche_start,
      tranche_end,
      total_added,
      total_removed,
      locked_amount,
      deposits,
      withdrawals,
      users,
    };
  });
}

const getBatched = async (filter, contract, provider, startblock) => {
  const batchSize = 100000;
  const currentBlockNumber = await provider.getBlockNumber();
  const batches = Math.ceil(currentBlockNumber / batchSize);
  const startIndex = Math.floor(startblock / batchSize);

  console.log(
    `Processing batches of size ${batches} starting at batch ${startIndex}`
  );
  let res = [];
  for (let index = startIndex; index < batches; index++) {
    let events = [];
    let attempts = 1;
    // Sometimes the queries fail for timeout even on small batch sizes. Some basic retry logic.
    while (attempts < MAX_ATTEMPTS) {
      try {
        events = await contract.queryFilter(
          filter,
          index * batchSize,
          (index + 1) * batchSize - 1
        );
        break;
      } catch {
        console.log('retry batch', index);
        ++attempts;
        if (attempts >= MAX_ATTEMPTS) {
          throw new Error('Could not get in 4 attempts');
        }
      }
    }
    res = [...events, ...res];

    console.log(
      `Processed blocks ${index * batchSize} to ${
        (index + 1) * batchSize - 1
      } as part of batch ${index}`
    );
  }
  return res;
};

const run = async (c) => {
  const provider = new ethers.providers.JsonRpcProvider({
    url: c.provider,
    timeout: 1000 * 60 * 1000,
  });

  const contract = new ethers.Contract(c.contract, vestingAbi, provider);
  const [created, added, removed] = await Promise.all([
    getBatched(
      contract.filters.Tranche_Created(),
      contract,
      provider,
      c.startBlock
    ),
    getBatched(
      contract.filters.Tranche_Balance_Added(),
      contract,
      provider,
      c.startBlock
    ),
    getBatched(
      contract.filters.Tranche_Balance_Removed(),
      contract,
      provider,
      c.startBlock
    ),
  ]);
  fs.writeFileSync(
    `./apps/static/src/assets/${c.env}-tranches.json`,
    JSON.stringify(
      getTranchesFromHistory(created, added, removed, 18),
      null,
      2
    ),
    { encoding: 'UTF-8' }
  );
};

CONFIG.forEach((c) => run(c));
