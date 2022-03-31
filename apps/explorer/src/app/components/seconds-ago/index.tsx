import { t } from '@vegaprotocol/react-helpers';
import { useEffect, useState } from 'react';

interface SecondsAgoProps {
  date: string | undefined;
}

export const SecondsAgo = ({ date, ...props }: SecondsAgoProps) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const int = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(int);
  }, [setNow]);

  if (!date) {
    return <>{t('Date unknown')}</>;
  }

  const timeAgoInSeconds = Math.floor((now - new Date(date).getTime()) / 1000);

  return (
    <div {...props}>
      {t(
        `${
          timeAgoInSeconds === 1 ? '1 second' : `${timeAgoInSeconds} seconds`
        } ago`
      )}
    </div>
  );
};
