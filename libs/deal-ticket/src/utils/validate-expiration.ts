import { t } from '@vegaprotocol/i18n';
import type { Validate } from 'react-hook-form';

export const validateExpiration: Validate<string | undefined> = (
  value?: string
) => {
  const now = new Date();
  const valueAsDate = value ? new Date(value) : now;
  if (now > valueAsDate) {
    return t('The expiry date that you have entered appears to be in the past');
  }
  return true;
};
