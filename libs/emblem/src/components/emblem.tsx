import type { ImgHTMLAttributes } from 'react';
import {
  DEFAULT_CHAIN,
  DEFAULT_VEGA_CHAIN,
  FALLBACK_URL,
  FILENAME,
  URL_BASE,
} from '../config/index';

export type ImgProps = ImgHTMLAttributes<HTMLImageElement>;

export type EmblemByContractProps = {
  contract: string;
  chainId?: string;
  asset?: never;
};

export type EmblemByAssetProps = {
  asset: string;
  vegaChain?: string;
  contract?: never;
};

export type EmblemProps = ImgProps &
  (EmblemByAssetProps | EmblemByContractProps);

/**
 * Type guard for generic Emblem component, which ends up rendering either an EmblemByContract
 * or EmblemByAsset depending on the arguments
 */
export function isEmblemByAsset(
  args: EmblemByAssetProps | EmblemByContractProps
): args is EmblemByAssetProps {
  return (args as EmblemByAssetProps).asset !== undefined;
}

/**
 * A generic component that will render an emblem for a Vega asset or a contract, depending on the props
 * @returns React.Node
 */
export function Emblem(props: EmblemProps) {
  if (isEmblemByAsset(props)) {
    return <EmblemByAsset {...props} />;
  } else {
    return <EmblemByContract {...props} />;
  }
}

/**
 * Given a contract address and a chain ID, it will render an emblem for the contract
 * @param contract string the contract address
 * @param chainId string? (default: Ethereum Mainnet)
 * @returns React.Node
 */
export function EmblemByContract(p: EmblemByContractProps) {
  const url = `${URL_BASE}/chain/${
    p.chainId ? p.chainId : DEFAULT_CHAIN
  }/asset/${p.contract}/${FILENAME}`;
  return <EmblemBase url={url} {...p} />;
}

/**
 * Given a Vega asset ID, it will render an emblem for the asset
 *
 * @param asset string the asset ID
 * @param vegaChain string the vega chain ID (default: Vega Mainnet)
 * @returns React.Node
 */
export function EmblemByAsset(p: EmblemByAssetProps) {
  const url = `${URL_BASE}/vega/${
    p.vegaChain ? p.vegaChain : DEFAULT_VEGA_CHAIN
  }/asset/${p.asset}/${FILENAME}`;
  return <EmblemBase url={url} {...p} />;
}

export interface EmblemBaseProps extends ImgProps {
  url: string;
  alt?: string;
}

/**
 * Renders an image tag with a known fallback if the emblem does not exist.
 * @param url string the URL of the emblem, probably calculated in EmblemByAsset or EmblemByContract
 * @returns React.Node
 */
export function EmblemBase(p: EmblemBaseProps) {
  const renderFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_URL;
  };

  return (
    <img
      src={p.url}
      onError={renderFallback}
      alt={p.alt || 'Emblem'}
      width="20"
      height="20"
      className="inline-block w-5 h-5 mx-2"
    />
  );
}
