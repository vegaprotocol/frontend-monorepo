import { encodeListAssetBridgeTx } from '../../../../../lib/encoders/abis/list-asset';
import { recoverAddress } from 'ethers/lib/utils';
import { useExplorerBundleSignersQuery } from './__generated__/BundleSigners';
import type { ProposalTerms } from '../../tx-proposal';
import { DApp, TOKEN_VALIDATOR, useLinks } from '@vegaprotocol/environment';
import { ExternalLink, Icon } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { IconNames } from '@blueprintjs/icons';
import { encodeUpdateAssetBridgeTx } from '../../../../../lib/encoders/abis/update-asset';
import { prepend0x } from '@vegaprotocol/smart-contracts';
import type { EncodeListAssetParameters } from '../../../../../lib/encoders/abis/list-asset';

import omit from 'lodash/omit';

export type BridgeFunction = 'list_asset' | 'set_asset_limits';

export interface BundleSignersProps {
  signatures: string;
  assetAddress: string;
  nonce: string;
  tx?: ProposalTerms['updateAsset'] | ProposalTerms['newAsset'];
  id: string;
}

/**
 * A logic-heavy component that takes in a signature bundle and returns
 * the list of validators that signed the bundle. To do this it requires
 * data from quite a few places - a network parameter, the signature bundle,
 * the asset that has been modified
 */
export const BundleSigners = ({
  signatures,
  nonce,
  assetAddress,
  tx,
  id,
}: BundleSignersProps) => {
  const tokenLink = useLinks(DApp.Governance);

  const bridgeFunction: BridgeFunction =
    tx?.changes?.erc20 && 'contractAddress' in tx.changes.erc20
      ? 'list_asset'
      : 'set_asset_limits';

  const { data } = useExplorerBundleSignersQuery();

  const bridgeAddress = getBridgeAddressFromNetworkParameter(
    data?.networkParameter?.value
  );

  const allEthereumKeys =
    data?.nodesConnection?.edges
      ?.filter((n) => n?.node.status === 'NODE_STATUS_VALIDATOR')
      .map((s) => s?.node) || [];

  if (!tx || !tx.changes?.erc20) {
    return null;
  }

  const { lifetimeLimit, withdrawThreshold } = tx.changes.erc20;

  if (
    !id ||
    allEthereumKeys.length === 0 ||
    !bridgeAddress ||
    !lifetimeLimit ||
    !withdrawThreshold
  ) {
    return null;
  }

  const signersLowerCase = getSigners(
    bridgeFunction,
    bridgeAddress,
    signatures,
    {
      assetERC20: assetAddress,
      assetId: prepend0x(id),
      limit: lifetimeLimit,
      threshold: withdrawThreshold,
      nonce,
    }
  );

  return (
    <>
      <h2 className="mt-4 mb-2 text-lg">{t('Signed by validators')}</h2>
      <ul>
        {allEthereumKeys?.map((n) => {
          if (!n) {
            return null;
          }

          const validatorPage = tokenLink(TOKEN_VALIDATOR.replace(':id', n.id));
          return signersLowerCase?.indexOf(
            n?.ethereumAddress.toLowerCase() || '??'
          ) !== -1 ? (
            <li key={n?.pubkey}>
              <ExternalLink href={validatorPage}>
                <Icon name={IconNames.ENDORSED} className="ml-1 mr-2" />
                {n?.name}
                <Icon size={3} name={IconNames.SHARE} className="ml-2" />
              </ExternalLink>
            </li>
          ) : (
            <li>
              <ExternalLink href={validatorPage}>
                <Icon name={IconNames.MINUS} className="ml-1 mr-2" />
                {n?.name}
                <Icon size={3} name={IconNames.SHARE} className="ml-2" />
              </ExternalLink>
            </li>
          );
        })}
      </ul>
    </>
  );
};

/**
 * Given all of the collated information, this function creates an equivalent unsigned bundle
 * and recovers the signers from it, In the case of an error, it returns an empty array.
 *
 * @param bridgeFunction Decides which data goes in to the digest
 * @param bridgeAddress ERC20 bridge address
 * @param signatures Long string of signatures
 * @param params The object containing all data that the bridge requires for New or Updating assets
 * @returns String[] Empty if there was an error or no signers were recovered, otherwise lowercased ETH addresses
 */
export function getSigners(
  bridgeFunction: BridgeFunction,
  bridgeAddress: string,
  signatures: string,
  params: EncodeListAssetParameters
): string[] {
  try {
    if (bridgeFunction === 'list_asset') {
      const digest = encodeListAssetBridgeTx(params, bridgeAddress);

      // Recover Address from digest can return null, which is handled as an empty array
      return recoverAddressesFromDigest(digest, signatures) || [];
    } else {
      // The params bundles are so similar, rather than force the component to make two different
      // styles, just delete the one different property
      const p = omit(params, 'assetId');
      const digest = encodeUpdateAssetBridgeTx(p, bridgeAddress);
      return recoverAddressesFromDigest(digest, signatures) || [];
    }
  } catch (e) {
    // In the worst case, no signing addresses are recovered. This means that all nodes will
    // be rendered as if they had not signed the bundle.
    return [];
  }
}

/**
 * Querying for the network parameter value gets us all of the contract details for this network
 * encoded as a JSON object. This function pulls out the address for the bridge, or returns null
 * in any of the many cases where it may fail
 *
 * @param networkParameterAsString the stringified JSON object
 * @returns null or bridge address as a string
 */
export function getBridgeAddressFromNetworkParameter(
  networkParameterAsString: string | undefined
): string | null {
  if (!networkParameterAsString) {
    return null;
  }

  try {
    const networkParameter = JSON.parse(networkParameterAsString);
    return networkParameter.collateral_bridge_contract.address;
  } catch (e) {
    // There is no good recovery state so return null
    return null;
  }
}

export function recoverAddressesFromDigest(
  digest: string,
  unprefixedBundle: string
) {
  // Remove 0x from bundle, then split it in to signatures
  const sigs = unprefixedBundle.substring(2).match(/.{1,130}/g);

  // Convert each of the signatures from hex to a string
  const hexSigs = sigs?.map((s) => `0x${s.toString()}`);

  if (!hexSigs) {
    return null;
  }

  // toLowerCase is a hack - something somewhere is lowercasing some
  // pubkeys
  return hexSigs.map((h) => recoverAddress(digest, h).toLowerCase());
}
