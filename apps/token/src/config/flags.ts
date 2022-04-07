const TRUTHY = ["1", "true"];

export const Flags = {
  NETWORK_DOWN: TRUTHY.includes(process.env.REACT_APP_NETWORK_DOWN!),
  HOSTED_WALLET_ENABLED: TRUTHY.includes(
    process.env.REACT_APP_HOSTED_WALLET_ENABLED!
  ),
  IN_CONTEXT_TRANSLATION: TRUTHY.includes(
    process.env.REACT_APP_IN_CONTEXT_TRANSLATION!
  ),
  MOCK: TRUTHY.includes(process.env.REACT_APP_MOCKED!),
  DEX_STAKING_DISABLED: TRUTHY.includes(
    process.env.REACT_APP_DEX_STAKING_DISABLED!
  ),
  FAIRGROUND: TRUTHY.includes(process.env.REACT_APP_FAIRGROUND!),
  NETWORK_LIMITS: TRUTHY.includes(process.env.REACT_APP_NETWORK_LIMITS!),
};
