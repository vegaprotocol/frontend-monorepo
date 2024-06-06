import { t } from '@vegaprotocol/i18n';
import { CHAIN_FILENAME } from '../config';
import { EmblemBase } from './emblem-base';
import { getVegaChain } from './lib/get-chain';
import { getVegaAssetLogoUrl } from './lib/url-builder';

export type EmblemByAssetProps = {
  asset: string;
  vegaChain?: string;
  showSourceChain?: boolean;
};

/**
 * Given a Vega asset ID, it will render an emblem for the asset
 *
 * @param asset string the asset ID
 * @param vegaChain string the vega chain ID (default: Vega Mainnet)
 * @returns React.Node
 */
export function EmblemByAsset(p: EmblemByAssetProps) {
  const chain = getVegaChain(p.vegaChain);

  return (
    <div className="relative inline-block">
      <EmblemBase src={getVegaAssetLogoUrl(chain, p.asset)} {...p} />
      {p.showSourceChain !== false && (
        <EmblemBase
          src={getVegaAssetLogoUrl(chain, p.asset, CHAIN_FILENAME)}
          width={12}
          height={12}
          alt={t('Chain logo')}
          className={`align-text-top absolute bottom-0 right-0`}
        />
      )}
    </div>
  );
}
