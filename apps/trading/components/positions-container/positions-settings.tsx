import { GridSettings } from '../grid-settings/grid-settings';
import { usePositionsStore } from './positions-container';

export const PositionsSettings = () => (
  <GridSettings
    updateGridStore={usePositionsStore((store) => store.updateGridStore)}
  />
);
