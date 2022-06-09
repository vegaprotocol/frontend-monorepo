import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import { AddLockedTokenAddress } from '../../components/add-locked-token';

export const CodeUsed = () => {
  const { t } = useTranslation();
  return (
    <Callout intent={Intent.Warning} iconName="error" title={t('codeUsed')}>
      <p>{t('codeUsedText')}</p>
      <AddLockedTokenAddress />
    </Callout>
  );
};
