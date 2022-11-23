import { t } from '@vegaprotocol/react-helpers';

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
