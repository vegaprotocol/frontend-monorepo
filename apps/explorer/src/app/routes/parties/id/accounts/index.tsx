import { t } from '@vegaprotocol/i18n';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toNonHex } from '../../../../components/search/detect-search';
import { PageHeader } from '../../../../components/page-header';
import { useDocumentTitle } from '../../../../hooks/use-document-title';

import { PartyAccounts } from '../components/party-accounts';

const PartyAccountsByAsset = () => {
  const { party } = useParams<{ party: string }>();

  useDocumentTitle(['Public keys', party || '-']);
  const partyId = toNonHex(party ? party : '');
  const { isMobile } = useScreenDimensions();
  const visibleChars = useMemo(() => (isMobile ? 10 : 14), [isMobile]);

  return (
    <section className="max-w-5xl mx-auto">
      <h1
        className="font-alpha calt uppercase font-xl mb-4 text-vega-dark-100 dark:text-vega-light-100"
        data-testid="parties-header"
      >
        {t('Public key')}
      </h1>
      <PageHeader
        title={partyId}
        copy
        truncateStart={visibleChars}
        truncateEnd={visibleChars}
      />

      <PartyAccounts partyId={partyId} />
    </section>
  );
};

export { PartyAccountsByAsset };
