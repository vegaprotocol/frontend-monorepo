const { env } = process;

const truthy = ['1', 'true'];

export default {
  assets: truthy.includes(env['NX_EXPLORER_ASSETS'] || ''),
  genesis: truthy.includes(env['NX_EXPLORER_GENESIS'] || ''),
  governance: truthy.includes(env['NX_EXPLORER_GOVERNANCE'] || ''),
  markets: truthy.includes(env['NX_EXPLORER_MARKETS'] || ''),
  networkParameters: truthy.includes(
    env['NX_EXPLORER_NETWORK_PARAMETERS'] || ''
  ),
  parties: truthy.includes(env['NX_EXPLORER_PARTIES'] || ''),
  validators: truthy.includes(env['NX_EXPLORER_VALIDATORS'] || ''),
};
