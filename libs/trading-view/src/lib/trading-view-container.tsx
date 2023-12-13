import { useScript } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useT } from './use-t';
import { TradingView, type OnAutoSaveNeededCallback } from './trading-view';
import { CHARTING_LIBRARY_FILE, type ResolutionString } from './constants';

export const TradingViewContainer = ({
  libraryPath,
  libraryHash,
  marketId,
  interval,
  studies,
  onIntervalChange,
  onAutoSaveNeeded,
}: {
  libraryPath: string;
  libraryHash: string;
  marketId: string;
  interval: ResolutionString;
  studies: string[];
  onIntervalChange: (interval: string) => void;
  onAutoSaveNeeded: OnAutoSaveNeededCallback;
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

  return (
    <TradingView
      libraryPath={libraryPath}
      marketId={marketId}
      interval={interval}
      studies={studies}
      onIntervalChange={onIntervalChange}
      onAutoSaveNeeded={onAutoSaveNeeded}
    />
  );
};
