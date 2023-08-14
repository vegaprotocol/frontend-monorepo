import { t } from '@vegaprotocol/i18n';

export const validateExpiration = (value?: string) => {
  const now = new Date();
  const valueAsDate = value ? new Date(value) : now;
  if (now > valueAsDate) {
    return t('The expiry date that you have entered appears to be in the past');
  }
  return true;
};
