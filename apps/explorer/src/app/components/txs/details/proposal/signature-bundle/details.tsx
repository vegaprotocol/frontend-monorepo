import { t } from '@vegaprotocol/i18n';
import { encodeListAssetBridgeTx } from '../../../../../lib/decoders/abis/list-asset';
import { recoverAddress } from 'ethers/lib/utils';

function getSigners(
  unprefixedBundle: string,
  assetERC20: string,
  assetId: string,
  limit: string,
  threshold: string,
  nonce: string,
  func: string
) {
  const BRIDGE_ADDRESS = '0x7fe27d970bc8Afc3B11Cc8d9737bfB66B1efd799';

  const digest = encodeListAssetBridgeTx(
    {
      assetERC20,
      assetId,
      limit,
      threshold,
      nonce,
    },
    BRIDGE_ADDRESS
  );

  const sigs = unprefixedBundle.match(/.{1,130}/g);
  const hexSigs = sigs?.map((s) => `0x${s.toString()}`);

  if (!hexSigs) {
    return null;
  }

  return hexSigs.map((h) => recoverAddress(digest, h));
}

export interface ProposalSignatureBundleDetailsProps {
  signatures: string;
  nonce: string;
}

export const ProposalSignatureBundleDetails = ({
  signatures,
  nonce,
}: ProposalSignatureBundleDetailsProps) => {
  const sigBundle = signatures.substring(2);

  const signers = getSigners(
    sigBundle,
    '0x0dB8C54c0C81F05241b4Fd13a5769F4465Ea2707',
    '0x285923fed8c66ffb416b163e8ec72d3a87b9b8e2570e7ee7fe97d7092a918bc8',
    '10000000000000000000000000000000',
    '1',
    '18250011763873610289536200551900545467959221115607409799241178172533618346952',
    'list_asset'
  );

  return (
    <details className="mt-5">
      <summary>{t('Signature bundle details')}</summary>

      <div className="ml-4">
        <h2 className="text-lg mt-2 mb-2">{t('Signatures')}</h2>
        <p>
          <textarea
            className="font-mono bg-neutral-300 text-[11px] leading-3 text-gray-900 w-full p-2 max-w-[615px]"
            readOnly={true}
            rows={12}
            cols={120}
            value={signatures}
          />
        </p>

        <h2 className="text-lg mt-5 mb-2">{t('Nonce')}</h2>
        <p>
          <textarea
            className="font-mono bg-neutral-300 text-[11px] leading-3 text-gray-900 w-full p-2 max-w-[615px]"
            readOnly={true}
            rows={2}
            cols={120}
            value={nonce}
          />
        </p>
      </div>
    </details>
  );
};
