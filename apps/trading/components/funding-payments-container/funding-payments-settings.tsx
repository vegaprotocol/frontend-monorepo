import { GridSettings } from '../grid-settings/grid-settings';
import { useFundingPaymentsStore } from './funding-payments-container';

export const FundingPaymentsSettings = () => (
  <GridSettings
    updateGridStore={useFundingPaymentsStore((store) => store.updateGridStore)}
  />
);
