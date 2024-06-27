import { render, screen } from '@testing-library/react';
import {
  fixStatus,
  TransferStatusIcon,
  getIconForStatus,
  getColourForStatus,
} from './transfer-status';
import { TransferStatus, TransferStatusMapping } from '@vegaprotocol/types';
import addYears from 'date-fns/addYears';
import subYears from 'date-fns/subYears';

describe('TransferStatusIcon', () => {
  it('renders transfer status icon', () => {
    const status = TransferStatus.STATUS_PENDING;
    render(<TransferStatusIcon status={status} />);
    expect(
      screen.getByTitle(TransferStatusMapping[status])
    ).toBeInTheDocument();
  });

  it('renders one off transfers with deliveron in the future', () => {
    const status = TransferStatus.STATUS_PENDING;
    render(
      <TransferStatusIcon
        status={status}
        deliverOn={addYears(new Date(), 1).toISOString()}
      />
    );
    expect(
      screen.getByTitle(TransferStatusMapping[status])
    ).toBeInTheDocument();
  });
});

describe('getIconForStatus', () => {
  it('returns correct icon name for transfer status', () => {
    expect(getIconForStatus(TransferStatus.STATUS_PENDING)).toBe('time');
    expect(getIconForStatus(TransferStatus.STATUS_DONE)).toBe('tick');
    expect(getIconForStatus(TransferStatus.STATUS_REJECTED)).toBe('cross');
    expect(getIconForStatus(TransferStatus.STATUS_CANCELLED)).toBe('cross');
    expect(getIconForStatus('' as TransferStatus)).toBe('time');
  });
});

describe('getColourForStatus', () => {
  it('returns correct colour for transfer status', () => {
    expect(getColourForStatus(TransferStatus.STATUS_PENDING)).toBe(
      'text-yellow-500'
    );
    expect(getColourForStatus(TransferStatus.STATUS_DONE)).toBe(
      'text-green-500'
    );
    expect(getColourForStatus(TransferStatus.STATUS_REJECTED)).toBe(
      'text-red-500'
    );
    expect(getColourForStatus(TransferStatus.STATUS_CANCELLED)).toBe(
      'text-red-600'
    );
    expect(getColourForStatus('' as TransferStatus)).toBe('text-yellow-500');
  });
});

describe('fixStatus', () => {
  it('returns STATUS_PENDING if deliverOn is a future date', () => {
    const status = TransferStatus.STATUS_DONE;
    const deliverOn = addYears(new Date(), 1).toISOString();
    const fixedStatus = fixStatus(status, deliverOn);
    expect(fixedStatus).toBe(TransferStatus.STATUS_PENDING);
  });

  it('returns the same status if deliverOn is not a future date', () => {
    const status = TransferStatus.STATUS_DONE;
    // Just to be safe, make deliverOn a date in the far past
    const deliverOn = subYears(new Date(), 1).toISOString();
    const fixedStatus = fixStatus(status, deliverOn);
    expect(fixedStatus).toBe(status);
  });
});
