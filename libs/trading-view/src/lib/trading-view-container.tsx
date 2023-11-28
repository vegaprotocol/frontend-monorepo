import { useScript } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useT } from './use-t';
import { TradingView } from './trading-view';
import { CHARTING_LIBRARY_FILE } from './constants';

export const TradingViewContainer = ({
  marketId,
  libraryPath,
  libraryHash,
}: {
  marketId: string;
  libraryPath: string;
  libraryHash: string;
}) => {
  const t = useT();
  const scriptState = useScript(
    libraryPath + CHARTING_LIBRARY_FILE,
    libraryHash
  );

  if (scriptState === 'loading' || scriptState === 'idle') {
    return (
      <Splash>
        <p>{t('Loading Trading View')}</p>
      </Splash>
    );
  }

  if (scriptState === 'error') {
    return (
      <Splash>
        <p>{t('Failed to initialize Trading view')}</p>
      </Splash>
    );
  }

  return <TradingView marketId={marketId} libraryPath={libraryPath} />;
};
