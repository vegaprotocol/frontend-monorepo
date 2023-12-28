import { GridSettings } from '../../components/grid-settings/grid-settings';
import { useMarketsStore } from './market-list-table';

export const MarketsSettings = () => (
  <GridSettings
    updateGridStore={useMarketsStore((store) => store.updateGridStore)}
  />
);
