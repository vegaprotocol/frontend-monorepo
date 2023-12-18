import { GridSettings } from '../grid-settings/grid-settings';
import { useStopOrdersStore } from './stop-orders-container';

export const StopOrdersSettings = () => (
  <GridSettings
    updateGridStore={useStopOrdersStore((store) => store.updateGridStore)}
  />
);
