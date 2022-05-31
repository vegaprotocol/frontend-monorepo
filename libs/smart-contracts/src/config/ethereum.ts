import type { Networks } from '@vegaprotocol/react-helpers';

const customVegaTokenAddress = process.env.CUSTOM_TOKEN_ADDRESS as string;
const customClaimAddress = process.env.CUSTOM_CLAIM_ADDRESS as string;
const customLockedAddress = process.env.CUSTOM_LOCKED_ADDRESS as string;

interface VegaContracts {
  vegaTokenAddress: string;
  claimAddress: string;
  lockedAddress: string;
}

export const EnvironmentConfig: { [key in Networks]: VegaContracts } = {
  CUSTOM: {
    vegaTokenAddress: customVegaTokenAddress,
    claimAddress: customClaimAddress,
    lockedAddress: customLockedAddress,
  },
  DEVNET: {
    vegaTokenAddress: '0xc93137f9F4B820Ca85FfA3C7e84cCa6Ebc7bB517',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994',
    lockedAddress: '0x0',
  },
  STAGNET: {
    vegaTokenAddress: '0x547cbA83a7eb82b546ee5C7ff0527F258Ba4546D',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  STAGNET2: {
    vegaTokenAddress: '0xd8fa193B93a179DdCf51FFFDe5320E0872cdcf44',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  TESTNET: {
    vegaTokenAddress: '0xDc335304979D378255015c33AbFf09B60c31EBAb',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  MAINNET: {
    vegaTokenAddress: '0xcB84d72e61e383767C4DFEb2d8ff7f4FB89abc6e',
    claimAddress: '0x0ee1fb382caf98e86e97e51f9f42f8b4654020f3',
    lockedAddress: '0x78344c7305d73a7a0ac3c94cd9960f4449a1814e',
  },
};
