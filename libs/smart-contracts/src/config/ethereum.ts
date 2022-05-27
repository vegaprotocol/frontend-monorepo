import { Networks } from './vega';

const customVegaTokenAddress = process.env.CUSTOM_TOKEN_ADDRESS as string;
const customClaimAddress = process.env.CUSTOM_CLAIM_ADDRESS as string;
const customLockedAddress = process.env.CUSTOM_LOCKED_ADDRESS as string;
const customVestingAddress = process.env.CUSTOM_VESTING_ADDRESS as string;
const customStakingBridge = process.env.CUSTOM_STAKING_BRIDGE as string;
const customErc20Bridge = process.env.CUSTOM_ERC20_BRIDGE as string;

export type EthereumChainId = '0x1' | '0x3' | '0x4' | '0x5' | '0x2a';

export type EthereumChainName =
  | 'Mainnet'
  | 'Ropsten'
  | 'Rinkeby'
  | 'Goerli'
  | 'Kovan';

export const EthereumChainNames: Record<EthereumChainId, EthereumChainName> = {
  '0x1': 'Mainnet',
  '0x3': 'Ropsten',
  '0x4': 'Rinkeby',
  '0x5': 'Goerli',
  '0x2a': 'Kovan',
};

export const EthereumChainIds: Record<EthereumChainName, EthereumChainId> = {
  Mainnet: '0x1',
  Ropsten: '0x3',
  Rinkeby: '0x4',
  Goerli: '0x5',
  Kovan: '0x2a',
};

export const ChainIdMap: Record<EthereumChainId, number> = {
  '0x1': 1,
  '0x3': 3,
  '0x4': 4,
  '0x5': 5,
  '0x2a': 42,
};
interface VegaContracts {
  vestingAddress: string;
  vegaTokenAddress: string;
  claimAddress: string;
  lockedAddress: string;
  stakingBridge: string;
  erc20Bridge: string;
}

export const EnvironmentConfig: { [key in Networks]: VegaContracts } = {
  [Networks.CUSTOM]: {
    vegaTokenAddress: customVegaTokenAddress,
    claimAddress: customClaimAddress,
    lockedAddress: customLockedAddress,
    vestingAddress: customVestingAddress,
    stakingBridge: customStakingBridge,
    erc20Bridge: customErc20Bridge,
  },
  [Networks.DEVNET]: {
    vegaTokenAddress: '0xc93137f9F4B820Ca85FfA3C7e84cCa6Ebc7bB517',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994',
    lockedAddress: '0x0',
    vestingAddress: '0xd1216AAb948f5FC706Df73df6d71c64CcaA8550a',
    stakingBridge: '0xf2cD5C8b8c52f96293338A0AF463a0Bfc602D5bc',
    erc20Bridge: '0xE43013C3c2A134AB3782ADEb258669A8566DAD57',
  },
  [Networks.STAGNET]: {
    vegaTokenAddress: '0x547cbA83a7eb82b546ee5C7ff0527F258Ba4546D',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
    vestingAddress: '0xfCe6eB272D3d4146A96bC28de71212b327F575fa',
    stakingBridge: '0x7D88CD817227D599815d407D929af18Bb8D57176',
    erc20Bridge: '0xc0835e6dEf177F8ba2561C4e4216827A3798c6B9',
  },
  [Networks.STAGNET2]: {
    vegaTokenAddress: '0xd8fa193B93a179DdCf51FFFDe5320E0872cdcf44',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
    vestingAddress: '0x9F10cBeEf03A564Fb914c2010c0Cd55E9BB11406',
    stakingBridge: '0x7896C9491962D5839783CB6e0492ECebd34Bb35F',
    erc20Bridge: '0xffC1eb64e22fd5E29816c633eE84088EEEe879E5',
  },
  [Networks.TESTNET]: {
    vegaTokenAddress: '0xDc335304979D378255015c33AbFf09B60c31EBAb',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
    vestingAddress: '0xe2deBB240b43EDfEBc9c38B67c0894B9A92Bf07c',
    stakingBridge: '0xF5A3830F002BE78dd801214F5316b677E0355c60',
    erc20Bridge: '0xF009C66c6afC9661143fD7cE1eDb02c1961a6510',
  },
  [Networks.MAINNET]: {
    vegaTokenAddress: '0xcB84d72e61e383767C4DFEb2d8ff7f4FB89abc6e',
    claimAddress: '0x0ee1fb382caf98e86e97e51f9f42f8b4654020f3',
    lockedAddress: '0x78344c7305d73a7a0ac3c94cd9960f4449a1814e',
    vestingAddress: '0x23d1bFE8fA50a167816fBD79D7932577c06011f4',
    stakingBridge: '0x195064D33f09e0c42cF98E665D9506e0dC17de68',
    erc20Bridge: '0xCd403f722b76366f7d609842C589906ca051310f',
  },
};

// No concept of dev/staging/test for these right now.
export const RewardsAddresses = {
  [EthereumChainIds.Mainnet]: {
    'SushiSwap VEGA/ETH': '0x285de24077440c53b1661287D170e3ae22de0a44',
    'SushiSwap VEGA/USDC': '0x49407c243c26f109b3c77c41dd83742164c20b5f',
  } as { [key: string]: string },
  [EthereumChainIds.Ropsten]: {
    'SushiSwap VEGA/ETH': '0xa93dd6912897c5fe8503a82234d829bc7905714b',
    'SushiSwap VEGA/USDC': '0xa93dd6912897c5fe8503a82234d829bc7905714b',
  } as { [key: string]: string },
};

export const RewardsPoolAddresses = {
  [EthereumChainIds.Mainnet]: {
    '0x285de24077440c53b1661287D170e3ae22de0a44':
      '0x29c827ce49accf68a1a278c67c9d30c52fbbc348',
    '0x49407c243c26f109b3c77c41dd83742164c20b5f':
      '0x42b7B8f8F83fA5cbf0176f8c24Ad51EbcD4B5F17',
  } as { [key: string]: string },
  [EthereumChainIds.Ropsten]: {
    // Only one deployed to this environment
    '0xa93dd6912897c5fe8503a82234d829bc7905714b':
      '0x29c827ce49accf68a1a278c67c9d30c52fbbc348',
  } as { [key: string]: string },
};
