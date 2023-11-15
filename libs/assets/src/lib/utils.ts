import { toBigNum } from '@vegaprotocol/utils';

export const getQuantumValue = (value: string, quantum: string) => {
  return toBigNum(value, 0).dividedBy(toBigNum(quantum, 0));
};
