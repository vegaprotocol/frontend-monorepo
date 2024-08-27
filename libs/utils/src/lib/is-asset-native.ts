export const isAssetNative = (address: string) => {
  return address.toLowerCase() === '0x' + 'e'.repeat(40);
};
