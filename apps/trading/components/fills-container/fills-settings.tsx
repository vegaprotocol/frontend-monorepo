import { GridSettings } from '../grid-settings/grid-settings';
import { useFillsStore } from './fills-container';

export const FillsSettings = () => (
  <GridSettings
    updateGridStore={useFillsStore((store) => store.updateGridStore)}
  />
);
