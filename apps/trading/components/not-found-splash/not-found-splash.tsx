import { Splash } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';

export const NotFoundSplash = () => {
  const t = useT();
  return (
    <Splash>
      <p>{t('Page not found')}</p>
    </Splash>
  );
};
