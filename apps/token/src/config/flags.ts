const TRUTHY = ['1', 'true'];

export const Flags = {
  NETWORK_DOWN: TRUTHY.includes(process.env['NX_NETWORK_DOWN']!),
  HOSTED_WALLET_ENABLED: TRUTHY.includes(
    process.env['NX_HOSTED_WALLET_ENABLED']!
  ),
  IN_CONTEXT_TRANSLATION: TRUTHY.includes(
    process.env['NX_IN_CONTEXT_TRANSLATION']!
  ),
  MOCK: TRUTHY.includes(process.env['NX_MOCKED']!),
  DEX_STAKING_DISABLED: TRUTHY.includes(
    process.env['NX_DEX_STAKING_DISABLED']!
  ),
  FAIRGROUND: TRUTHY.includes(process.env['NX_FAIRGROUND']!),
  NETWORK_LIMITS: TRUTHY.includes(process.env['NX_NETWORK_LIMITS']!),
};
