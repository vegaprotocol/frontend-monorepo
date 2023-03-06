import { render } from '@testing-library/react';
import { AssetStatus } from '@vegaprotocol/types';
import { IconForBundleStatus } from './bundle-icon';

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
      const screen = render(<IconForBundleStatus status={status} />);
      const i = screen.getByRole('img');
      expect(i).toHaveAttribute('aria-label');
      expect(i.getAttribute('aria-label')).toMatch(/clean/);
    }
  );

  it.each(ERROR_STATUS)(
    'show an error icon if the bundle is unavailable',
    (status) => {
      const screen = render(<IconForBundleStatus status={status} />);
      const i = screen.getByRole('img');
      expect(i).toHaveAttribute('aria-label');
      expect(i.getAttribute('aria-label')).toMatch(/disable/);
    }
  );

  it.each(ENABLED_STATUS)(
    'shows a tick if the bundle is already used',
    (status) => {
      const screen = render(<IconForBundleStatus status={status} />);
      const i = screen.getByRole('img');
      expect(i).toHaveAttribute('aria-label');
      expect(i.getAttribute('aria-label')).toMatch(/tick-circle/);
    }
  );
});
