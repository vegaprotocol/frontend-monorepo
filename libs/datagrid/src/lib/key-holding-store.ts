import { create } from 'zustand';
import { useCallback, useEffect } from 'react';

type KeyHoldingStore = {
  holdingKey: string;
};

export const useKeyHoldingStore = create<KeyHoldingStore>()(() => ({
  holdingKey: '',
}));

export const useKeyHoldingHandlers = () => {
  const handleKeyDown = useCallback((ev: KeyboardEvent) => {
    useKeyHoldingStore.setState({ holdingKey: ev.key });
  }, []);
  const handleKeyUp = useCallback(() => {
    useKeyHoldingStore.setState({ holdingKey: '' });
  }, []);
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
