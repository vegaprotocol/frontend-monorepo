import classNames from 'classnames';
import { Fragment, useState, useCallback } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { t } from '@vegaprotocol/react-helpers';
import {
  Link,
  Icon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '../../hooks/use-environment';
import { Networks } from '../../types';

export const envNameMapping: Record<Networks, string> = {
  [Networks.CUSTOM]: t('Custom'),
  [Networks.DEVNET]: t('Devnet'),
  [Networks.STAGNET3]: t('Stagnet3'),
  [Networks.TESTNET]: t('Fairground testnet'),
  [Networks.MAINNET]: t('Mainnet'),
};

export const envTriggerMapping: Record<Networks, string> = {
  ...envNameMapping,
  [Networks.TESTNET]: t('Fairground'),
};

export const envDescriptionMapping: Record<Networks, string> = {
  [Networks.CUSTOM]: '',
  [Networks.DEVNET]: t('The latest Vega code auto-deployed'),
  [Networks.STAGNET3]: t('A staging environment with trading'),
  [Networks.TESTNET]: t(
    'Public testnet run by the Vega team, often used for incentives'
  ),
  [Networks.MAINNET]: t('The vega mainnet'),
};

const standardNetworkKeys = [Networks.MAINNET, Networks.TESTNET];
const advancedNetworkKeys = [
  Networks.MAINNET,
  Networks.TESTNET,
  Networks.STAGNET3,
  Networks.DEVNET,
];

type NetworkLabelProps = {
  isCurrent: boolean;
  isAvailable: boolean;
};

const getLabelText = ({
  isCurrent = false,
  isAvailable = false,
}: NetworkLabelProps) => {
  if (isCurrent) {
    return ` (${t('current')})`;
  }
  if (!isAvailable) {
    return ` (${t('not available')})`;
  }
  return '';
};

const NetworkLabel = ({
  isCurrent = false,
  isAvailable = false,
}: NetworkLabelProps) => (
  <span className="text-neutral-800">
    {getLabelText({ isCurrent, isAvailable })}
  </span>
);

export const NetworkSwitcher = () => {
  const { VEGA_ENV, VEGA_NETWORKS } = useEnvironment();
  const [isOpen, setOpen] = useState(false);
  const [isAdvancedView, setAdvancedView] = useState(false);

  const handleOpen = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
        setAdvancedView(false);
      }
    },
    [setOpen, setAdvancedView]
  );

  const menuItemClasses = 'pt-4 pb-4 !pl-6 !pr-6 !h-auto';

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpen}>
      <DropdownMenuPrimitive.Trigger
        className={classNames('text-white', {
          'bg-dropdown-bg-dark': isOpen,
        })}
        onClick={() => handleOpen(!isOpen)}
      >
        <span className="mr-4">{envTriggerMapping[VEGA_ENV]}</span>
        <Icon name="chevron-down" />
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuContent
        align="start"
        className="bg-dropdown-bg-dark border-none"
      >
        {!isAdvancedView && (
          <>
            {standardNetworkKeys.map((key) => (
              <DropdownMenuItem
                key={key}
                data-testid="network-item"
                disabled={!VEGA_NETWORKS[key]}
                className={classNames(menuItemClasses, {
                  'text-white': !!VEGA_NETWORKS[key],
                  'cursor-not-allowed text-neutral-800': !VEGA_NETWORKS[key],
                })}
              >
                <a
                  href={VEGA_NETWORKS[key]}
                  className="h-full block no-underline"
                >
                  {envNameMapping[key]}
                  <NetworkLabel
                    isCurrent={VEGA_ENV === key}
                    isAvailable={!!VEGA_NETWORKS[key]}
                  />
                </a>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              className={classNames(menuItemClasses, 'text-neutral-800')}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAdvancedView(true);
              }}
            >
              {t('Advanced')}
            </DropdownMenuItem>
          </>
        )}
        {isAdvancedView && (
          <div className="grid py-8 px-6 grid-cols-[repeat(2,_minmax(0,_auto))] gap-y-4 gap-x-8">
            {advancedNetworkKeys.map((key) => (
              <Fragment key={key}>
                <div className="py-8" data-testid="network-item-advanced">
                  <Link
                    href={VEGA_NETWORKS[key]}
                    className={classNames({
                      'text-white': !!VEGA_NETWORKS[key],
                      'cursor-not-allowed text-neutral-800':
                        !VEGA_NETWORKS[key],
                    })}
                  >
                    {envNameMapping[key]}
                  </Link>
                  <NetworkLabel
                    isCurrent={VEGA_ENV === key}
                    isAvailable={!!VEGA_NETWORKS[key]}
                  />
                </div>
                <span
                  className="text-white py-4"
                  data-testid="network-item-description"
                >
                  {envDescriptionMapping[key]}
                </span>
              </Fragment>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
