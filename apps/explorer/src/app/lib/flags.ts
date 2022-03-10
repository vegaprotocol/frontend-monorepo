const truthy = ['1', 'true'];

export default {
  assets: truthy.includes(process.env['NX_EXPLORER_ASSETS'] || ''),
  genesis: truthy.includes(process.env['NX_EXPLORER_GENESIS'] || ''),
  governance: truthy.includes(process.env['NX_EXPLORER_GOVERNANCE'] || ''),
  markets: truthy.includes(process.env['NX_EXPLORER_MARKETS'] || ''),
  networkParameters: truthy.includes(
    process.env['NX_EXPLORER_NETWORK_PARAMETERS'] || ''
  ),
  parties: truthy.includes(process.env['NX_EXPLORER_PARTIES'] || ''),
  validators: truthy.includes(process.env['NX_EXPLORER_VALIDATORS'] || ''),
};
