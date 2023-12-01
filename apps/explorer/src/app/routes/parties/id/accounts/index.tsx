import { t } from '@vegaprotocol/i18n';
import { useParams } from 'react-router-dom';
import { toNonHex } from '../../../../components/search/detect-search';
import { PageHeader } from '../../../../components/page-header';
import { useDocumentTitle } from '../../../../hooks/use-document-title';

import { PartyAccounts } from '../components/party-accounts';

type Params = { party: string };

const PartyAccountsByAsset = () => {
  const { party } = useParams<Params>();

  useDocumentTitle(['Public keys', party || '-']);
  const partyId = toNonHex(party ? party : '');

  return (
    <section>
      <PageHeader title={t('Balances by asset')} />

      <PartyAccounts partyId={partyId} />
    </section>
  );
};

export { PartyAccountsByAsset };
