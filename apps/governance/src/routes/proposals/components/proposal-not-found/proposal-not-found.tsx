import { useTranslation } from 'react-i18next';
import { SubHeading } from '../../../../components/heading';

export const ProposalNotFound = () => {
  const { t } = useTranslation();
  return (
    <section data-testid="proposal-not-found">
      <header>
        <SubHeading title={t('ProposalNotFound')} />
      </header>
      <p>{t('ProposalNotFoundDetails')}</p>
    </section>
  );
};
