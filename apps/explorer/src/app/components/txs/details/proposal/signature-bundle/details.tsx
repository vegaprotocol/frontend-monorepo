import { t } from '@vegaprotocol/i18n';
import type { ProposalTerms } from '../../tx-proposal';
import { BundleSigners } from './bundle-signers';

export interface ProposalSignatureBundleDetailsProps {
  signatures: string;
  nonce: string;
  tx?: ProposalTerms
}

export const ProposalSignatureBundleDetails = ({
  signatures,
  nonce,
  tx
}: ProposalSignatureBundleDetailsProps) => {

  return (
    <>
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
      <BundleSigners signatures={signatures} nonce={nonce} tx={tx} />
    </>
  );
};
