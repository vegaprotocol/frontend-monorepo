export enum VegaTxStatus {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Error = 'Error',
  Complete = 'Complete',
}

export interface VegaTxState {
  status: VegaTxStatus;
  error: Error | null;
  txHash: string | null;
  signature: string | null;
  dialogOpen: boolean;
}
