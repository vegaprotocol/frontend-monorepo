import { VegaIcon, VegaIconNames } from '../icon';
import { TradingButton } from '../trading-button';
import {
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownTrigger,
} from './trading-dropdown';

export const ActionsDropdownTrigger = () => {
  return (
    <TradingDropdownTrigger data-testid="dropdown-menu">
      <button type="button">
        <VegaIcon name={VegaIconNames.KEBAB} />
      </button>
    </TradingDropdownTrigger>
  );
};

export const MobileActionsDropdownTrigger = () => {
  return (
    <TradingDropdownTrigger data-testid="dropdown-menu">
      <TradingButton size="medium">
        <VegaIcon name={VegaIconNames.KEBAB} />
      </TradingButton>
    </TradingDropdownTrigger>
  );
};

type ActionMenuContentProps = React.ComponentProps<
  typeof TradingDropdownContent
>;

export const ActionsDropdown = (props: ActionMenuContentProps) => {
  return (
    <TradingDropdown trigger={<ActionsDropdownTrigger />}>
      <TradingDropdownContent {...props} side="bottom" align="end" />
    </TradingDropdown>
  );
};

export const MobileActionsDropdown = (props: ActionMenuContentProps) => {
  return (
    <TradingDropdown trigger={<MobileActionsDropdownTrigger />}>
      <TradingDropdownContent {...props} side="bottom" align="end" />
    </TradingDropdown>
  );
};
