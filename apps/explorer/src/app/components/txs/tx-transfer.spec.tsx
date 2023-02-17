import { getTypeLabelForTransfer } from './details/tx-transfer';
import type { components } from '../../../types/explorer';

type Transfer = components['schemas']['commandsv1Transfer'];

describe('TX: Transfer: getLabelForTransfer', () => {
  it('renders reward top up label if the TO party is 000', () => {
    const mock: Transfer = {
      to: '0000000000000000000000000000000000000000000000000000000000000000',
      recurring: {
        dispatchStrategy: {},
      },
    };

    expect(getTypeLabelForTransfer(mock)).toEqual('Reward top up transfer');
  });

  it('renders reward top up label if the TO party is network', () => {
    const mock = {
      to: 'network',
      recurring: {
        dispatchStrategy: {},
      },
    };

    expect(getTypeLabelForTransfer(mock)).toEqual('Reward top up transfer');
  });

  it('renders recurring label if the tx has a recurring property', () => {
    const mock: Transfer = {
      to: '0000000000000000000000000000000000000000000000000000000000000001',
      recurring: {
        startEpoch: '0',
      },
    };

    expect(getTypeLabelForTransfer(mock)).toEqual('Recurring transfer');
  });

  it('renders one off label if the tx has a oneOff property', () => {
    const mock: Transfer = {
      to: '0000000000000000000000000000000000000000000000000000000000000001',
      oneOff: {
        deliverOn: '0',
      },
    };

    expect(getTypeLabelForTransfer(mock)).toEqual('Transfer');
  });

  it('renders one off label otherwise', () => {
    const mock: Transfer = {
      to: '0000000000000000000000000000000000000000000000000000000000000001',
    };

    expect(getTypeLabelForTransfer(mock)).toEqual('Transfer');
  });
});
