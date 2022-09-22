import { useTranslation } from 'react-i18next';

export const ProposalNotFound = () => {
  const { t } = useTranslation();
  return (
    <section data-testid="proposal-not-found">
      <header>
        <h2 className="text-lg mx-0 mt-0 mb-1 font-semibold">
          {t('ProposalNotFound')}
        </h2>
      </header>
      <p>{t('ProposalNotFoundDetails')}</p>
    </section>
  );
};
