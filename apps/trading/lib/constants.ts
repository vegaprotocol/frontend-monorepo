import { type Address } from 'viem';

// The name of the app to be used in the document title and elsewhere in the UI
export const APP_NAME = 'APP_NAME';

// The asset to be used for deposits during onboarding
export const ONBOARDING_TARGET_ASSET =
  '520c3d2c121ba80186425d5c81d00c332d7bac7948835abced657c7faa6b8f4c';
// '2a1f29de786c49d7d4234410bf2e7196a6d173730288ffe44b1f7e282efb92b1';

// The smart contract to receive squid deposits so that recovery of assets can
// be done if the swap was not successfull
export const SQUID_RECEIVER_ADDRESS =
  '0xE7477a9aDb9BA0d00Af8f4d8e5E53A532C650ffa' as Address;
