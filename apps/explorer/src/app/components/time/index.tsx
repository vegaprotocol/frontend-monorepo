import { t } from '@vegaprotocol/i18n';

interface TimeProps {
  date: string | null | undefined;
}

export const Time = ({ date }: TimeProps) => {
  if (!date) {
    return <>{t('Date unknown')}</>;
  }
  const timeFormatted = new Date(date).toLocaleString();

  return <span>{timeFormatted}</span>;
};
