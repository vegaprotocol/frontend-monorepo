import { GridSettings } from '../grid-settings/grid-settings';
import { useTradesStore } from './trades-container';

export const TradesSettings = () => (
  <GridSettings
    updateGridStore={useTradesStore((store) => store.updateGridStore)}
  />
);
