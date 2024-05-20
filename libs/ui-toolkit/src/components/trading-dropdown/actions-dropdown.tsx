import { VegaIcon, VegaIconNames } from '../icon';
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
