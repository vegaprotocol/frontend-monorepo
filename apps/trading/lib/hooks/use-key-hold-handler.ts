import { useCallback, useEffect } from 'react';
import { useGlobalStore } from '../../stores';

export const useKeyHoldHandlers = () => {
  const setHoldingKey = useGlobalStore(
    (store) => (key: string) => store.update({ holdingKey: key })
  );
  const handleKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      setHoldingKey(ev.key);
    },
    [setHoldingKey]
  );
  const handleKeyUp = useCallback(() => {
    setHoldingKey('');
  }, [setHoldingKey]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('contextmenu', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('contextmenu', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
};
