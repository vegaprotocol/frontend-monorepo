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
 */
export const IconForBundleStatus = ({ status }: IconForBundleStatusProps) => {
  const i = getIcon(status)
  
  return <Icon className="float-left mt-2 mr-3" name={i} ariaLabel={status} />;
};


export function getIcon(status?: AssetStatus): IconName {
   switch(status) {
    case 'STATUS_ENABLED': 
      return 'tick-circle';
    case undefined:
      return 'disable'
    default:
      return 'clean';
   }
}
