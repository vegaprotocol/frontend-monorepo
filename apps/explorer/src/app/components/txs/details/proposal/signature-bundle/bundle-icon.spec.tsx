import { AssetStatus } from '@vegaprotocol/types';
import { getIcon } from './bundle-icon';

describe('Bundle status icon', () => {
  const NON_ENABLED_STATUS: AssetStatus[] = [
    AssetStatus.STATUS_PENDING_LISTING,
    AssetStatus.STATUS_PROPOSED,
  ];

  const ERROR_STATUS: AssetStatus[] = [AssetStatus.STATUS_REJECTED];

  const ENABLED_STATUS: AssetStatus[] = [AssetStatus.STATUS_ENABLED];

  it.each(NON_ENABLED_STATUS)(
    'show a sparkle icon if the bundle is unused',
    (status) => {
      expect(getIcon(status)).toEqual('clean');
    }
  );

  it.each(ERROR_STATUS)(
    'show an error icon if the bundle is unavailable',
    (status) => {
      expect(getIcon(status)).toEqual('disable');
    }
  );

  it.each(ENABLED_STATUS)(
    'shows a tick if the bundle is already used',
    (status) => {
      expect(getIcon(status)).toEqual('tick-circle');
    }
  );
});
