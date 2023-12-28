import { GridSettings } from '../grid-settings/grid-settings';
import { useAccountStore } from './accounts-container';

export const AccountsSettings = () => (
  <GridSettings
    updateGridStore={useAccountStore((store) => store.updateGridStore)}
  />
);
