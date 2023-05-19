import type { RouteChildProps } from '..';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { Heading } from '../../components/heading';
import { useTranslation } from 'react-i18next';

const Disclaimer = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  return (
    <>
      <Heading title={t('Disclaimer')} />
      <p className="mb-6 mt-10">{t('disclaimer1')}</p>
      <p className="mb-6">{t('disclaimer2')}</p>
      <p className="mb-6">{t('disclaimer3')}</p>
      <p className="mb-8">{t('disclaimer4')}</p>
      <p className="mb-8">{t('disclaimer5')}</p>
    </>
  );
};

export default Disclaimer;
