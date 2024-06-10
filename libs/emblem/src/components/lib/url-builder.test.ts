import { getChainAssetLogoUrl, getVegaAssetLogoUrl } from './url-builder';
import { URL_BASE, FILENAME } from '../../config';

describe('getChainAssetLogoUrl', () => {
  it('should generate the correct URL for an asset', () => {
    const chain = '1';
    const contract = '0x1234567890abcdef';
    const expectedUrl = `${URL_BASE}/chain/${chain}/asset/${contract}/${FILENAME}`;
    const result = getChainAssetLogoUrl(chain, contract);
    expect(result).toBe(expectedUrl);
  });
});

describe('getVegaAssetLogoUrl', () => {
  it('should generate the correct URL for an asset', () => {
    const chain = 'vega-chain';
    const asset = 'asset-id';
    const expectedUrl = `${URL_BASE}/vega/${chain}/asset/${asset}/${FILENAME}`;
    const result = getVegaAssetLogoUrl(chain, asset);
    expect(result).toBe(expectedUrl);
  });

  it('should generate the correct URL for an asset with a custom filename', () => {
    const chain = 'vega-chain';
    const asset = 'asset-id';
    const filename = 'custom-filename.png';
    const expectedUrl = `${URL_BASE}/vega/${chain}/asset/${asset}/${filename}`;
    const result = getVegaAssetLogoUrl(chain, asset, filename);
    expect(result).toBe(expectedUrl);
  });
});
