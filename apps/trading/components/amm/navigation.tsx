import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useConfig } from '@/lib/hooks/use-config';
import { useWallet } from '@/lib/hooks/use-wallet';
import { useVegaWalletDialogStore } from '@/lib/hooks/use-wallet-dialog-store';
import { cn, t, truncateMiddle } from '@/lib/utils';
import { Links } from '@/router';
import { CheckIcon, WalletIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export const Navigation = () => {
  return (
    <div className="flex justify-center p-1">
      <div className="flex-1">
        <Link to={Links.HOME()} className="font-bold">
          {t('NAVIGATION_ITEM_HOME')}
        </Link>
      </div>
      <div className="flex flex-1 justify-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                asChild
              >
                <Link to={Links.EXPLORE()}>{t('NAVIGATION_ITEM_EXPLORE')}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                asChild
              >
                <Link to={Links.POOLS()}>{t('NAVIGATION_ITEM_POOLS')}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                asChild
              >
                <Link to={Links.LIQUIDITY()}>
                  {t('NAVIGATION_ITEM_LIQUIDITY')}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex flex-1 justify-end">
        <VegaConnectButton />
      </div>
    </div>
  );
};

export const VegaConnectButton = () => {
  const { setOpen: setVegaWalletDialogOpen } = useVegaWalletDialogStore();
  const [status, pubKey, keys] = useWallet((store) => [
    store.status,
    store.pubKey,
    store.keys,
  ]);
  const { disconnect, store } = useConfig();

  const selectKey = (key: string) => {
    store.setState({ pubKey: key });
  };

  if (status === 'disconnected' || status === 'connecting') {
    return (
      <Button
        variant="outline"
        className="flex gap-1"
        onClick={() => setVegaWalletDialogOpen(true)}
      >
        {status === 'disconnected'
          ? t('WALLET_CONNECT')
          : t('WALLET_CONNECTING')}{' '}
        <WalletIcon size={16} />
      </Button>
    );
  }

  if (status === 'connected') {
    const connectedKey = {
      name: keys.find((k) => k.publicKey === pubKey)?.name,
      publicKey: pubKey,
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex gap-1">
            {connectedKey.name && connectedKey.name + ' | '}{' '}
            {connectedKey.publicKey
              ? truncateMiddle(connectedKey.publicKey)
              : t('WALLET_UNKNOWN_KEY')}{' '}
            <WalletIcon size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuGroup className="border-b">
            {keys.map((key) => {
              return (
                <DropdownMenuItem
                  key={key.publicKey}
                  onClick={() => {
                    selectKey(key.publicKey);
                  }}
                  className={cn(
                    'relative mb-1 flex cursor-pointer gap-1 pr-7',
                    {
                      'border bg-zinc-100': key.publicKey === pubKey,
                    }
                  )}
                >
                  {key.name && key.name + ' | '}{' '}
                  {key.publicKey
                    ? truncateMiddle(key.publicKey)
                    : t('WALLET_UNKNOWN_KEY')}{' '}
                  {key.publicKey === pubKey && (
                    <CheckIcon size={12} className="absolute right-2" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => disconnect()}
            >
              {t('WALLET_DISCONNECT')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
};
