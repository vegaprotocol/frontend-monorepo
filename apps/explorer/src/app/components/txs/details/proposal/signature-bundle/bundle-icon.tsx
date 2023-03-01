import type { AssetStatus } from '@vegaprotocol/types';
import type { IconName } from '@vegaprotocol/ui-toolkit';
import { Icon } from '@vegaprotocol/ui-toolkit';

export interface IconForBundleStatusProps {
  status?: AssetStatus;
}

/**
 * Naively select an icon for an asset. If it is enabled, we show a tick - anything
 * else is assumed to be 'in progress'. There should only be a signature bundle or the
 * asset should not exist
 *
 * @param param0
 * @returns
 */
export const IconForBundleStatus = ({ status }: IconForBundleStatusProps) => {
  const i: IconName = status === 'STATUS_ENABLED' ? 'tick-circle' : 'clean';
  return <Icon className="float-left mt-2 mr-3" name={i} />;
};
