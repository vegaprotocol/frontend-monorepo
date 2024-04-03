import { useDialogStore } from './use-dialog-store';
import { useDisconnect } from './use-disconnect';

export function useReconnect() {
  const openDialog = useDialogStore((store) => store.open);
  const { disconnect } = useDisconnect();

  return async () => {
    await disconnect();
    openDialog();
  };
}
