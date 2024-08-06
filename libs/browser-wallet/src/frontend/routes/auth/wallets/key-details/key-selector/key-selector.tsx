import { Dropdown } from '@/components/dropdown';
import { Header } from '@/components/header';
import { KeyList } from '@/components/key-list';
import { useWalletStore } from '@/stores/wallets';
import type { Key } from '@/types/backend';

export const locators = {
  keySelectedCurrentKey: 'selected-current-key',
  keySelectorDropdownContent: 'key-selector-dropdown-content',
};

export const KeySelector = ({ currentKey }: { currentKey: Key }) => {
  const { keys } = useWalletStore((state) => ({
    keys: state.wallets.flatMap((w) => w.keys),
  }));

  return (
    <Dropdown
      enabled={keys.length > 1}
      trigger={
        <div data-testid={locators.keySelectedCurrentKey}>
          <Header content={currentKey.name} />
        </div>
      }
      content={(setOpen) => (
        <div data-testid={locators.keySelectorDropdownContent} className="my-4">
          <KeyList keys={keys} onClick={() => setOpen(false)} />
        </div>
      )}
    />
  );
};
