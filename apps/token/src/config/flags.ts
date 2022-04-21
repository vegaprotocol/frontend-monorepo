const TRUTHY = ['1', 'true'];

export const Flags = {
  NETWORK_DOWN: TRUTHY.includes(process.env['NX_NETWORK_DOWN']!),
  HOSTED_WALLET_ENABLED: TRUTHY.includes(
    process.env['NX_HOSTED_WALLET_ENABLED']!
  ),
  MOCK: TRUTHY.includes(process.env['NX_MOCKED']!),
  FAIRGROUND: TRUTHY.includes(process.env['NX_FAIRGROUND']!),
  NETWORK_LIMITS: TRUTHY.includes(process.env['NX_NETWORK_LIMITS']!),
};
