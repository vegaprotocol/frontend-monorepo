/**
 * From:
 * https://github.com/ChainSafe/web3.js/blob/436e77a8eaa061fbaa183a9f73ca590c2e1d7697/packages/web3-utils/src/index.js
 */
export const asciiToHex = (str: string) => {
  if (!str) return '0x00';

  let hex = '';

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const n = code.toString(16);
    hex += n.length < 2 ? '0' + n : n;
  }

  return '0x' + hex;
};
