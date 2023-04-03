import { useLocalStorageSnapshot } from '@vegaprotocol/react-helpers';
import { useCallback, useMemo } from 'react';

const STORAGE_KEY = 'DEPOSIT_FORM_STORAGE';
interface PersistedDeposit {
  assetId: string;
  amount?: string;
}
type PersistedDepositData = Record<string, PersistedDeposit>;

export const usePersistentDeposit = (
  assetId?: string
): [PersistedDeposit, (entry: PersistedDeposit) => void] => {
  const [value, saveValue] = useLocalStorageSnapshot(STORAGE_KEY);
  const parsedValues = useMemo(
    () => JSON.parse(value || '{}') as PersistedDepositData,
    [value]
  );
  const savedData = useMemo(() => {
    const index = assetId || Object.keys({ ...parsedValues }).pop() || '';
    return parsedValues[index] || { assetId: assetId || '' };
  }, [parsedValues, assetId]);
  const saveValueWrapper = useCallback(
    (entry: PersistedDeposit) => {
      parsedValues[entry.assetId] = entry;
      saveValue(JSON.stringify(parsedValues));
    },
    [saveValue, parsedValues]
  );

  return [savedData, saveValueWrapper];
};
