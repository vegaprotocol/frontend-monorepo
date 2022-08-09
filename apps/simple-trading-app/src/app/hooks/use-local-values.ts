import { useMemo, useState } from 'react';
import type { LocalValues } from '../context/local-context';

const useLocalValues = () => {
  const [connect, setConnect] = useState<boolean>(false);
  const [manage, setManage] = useState<boolean>(false);
  return useMemo<LocalValues>(
    () => ({
      vegaWalletDialog: { connect, manage, setConnect, setManage },
    }),
    [connect, manage, setConnect, setManage]
  );
};

export default useLocalValues;
