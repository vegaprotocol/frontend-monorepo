const TRUTHY = ['1', 'true'];

export const Flags = {
  NETWORK_DOWN: TRUTHY.includes(process.env['NX_NETWORK_DOWN'] as string),
  HOSTED_WALLET_ENABLED: TRUTHY.includes(
    process.env['NX_HOSTED_WALLET_ENABLED'] as string
  ),
  MOCK: TRUTHY.includes(process.env['NX_MOCKED'] as string),
  FAIRGROUND: TRUTHY.includes(process.env['NX_FAIRGROUND'] as string),
  NETWORK_LIMITS: TRUTHY.includes(process.env['NX_NETWORK_LIMITS'] as string),
};
