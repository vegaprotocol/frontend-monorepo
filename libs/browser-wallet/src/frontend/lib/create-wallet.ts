import type { SendMessage } from '@/contexts/json-rpc/json-rpc-provider';

import { RpcMethods } from './client-rpc-methods';

export const WALLET_NAME = 'Wallet 1';

export const importWallet = async (
  mnemonic: string,
  request: SendMessage,
  propagateError: boolean
) => {
  await request(
    RpcMethods.ImportWallet,
    { recoveryPhrase: mnemonic, name: WALLET_NAME },
    propagateError
  );
  await request(
    RpcMethods.GenerateKey,
    {
      wallet: WALLET_NAME,
    },
    propagateError
  );
  await request(
    RpcMethods.GenerateKey,
    {
      wallet: WALLET_NAME,
    },
    propagateError
  );
};

export const createWallet = async (mnemonic: string, request: SendMessage) => {
  await request(RpcMethods.ImportWallet, {
    recoveryPhrase: mnemonic,
    name: WALLET_NAME,
  });
  await request(RpcMethods.GenerateKey, {
    wallet: WALLET_NAME,
  });
};

const SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4';

export const createDerivedWallet = async (
  chainId: number,
  account: string,
  request: SendMessage
) => {
  const params = {
    domain: { name: 'Vega', chainId: 1 },
    message: { action: 'Vega Onboarding' },
    primaryType: 'Vega',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'chainId', type: 'uint256' },
      ],
      Vega: [{ name: 'action', type: 'string' }],
    },
  };
  const res = await window.ethereum.request({
    method: SIGN_TYPED_DATA_V4,
    params: [account, JSON.stringify(params)],
  });
  // TODO if res is not successful then throw an error
  console.log(res);
  // TODO take the value of the signed message and pass it to the backend
  const { derivedMnemonic } = await request(RpcMethods.CreateDerivedMnemonic, {
    signedData: res,
  });
  console.log(derivedMnemonic);
  return createWallet(derivedMnemonic, request);
};
