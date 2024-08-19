import { VegaIcon, VegaIconNames } from '../icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';

export const ActionsDropdownTrigger = ({
  vertical,
}: {
  vertical?: boolean;
}) => {
  return (
    <DropdownMenuTrigger data-testid="dropdown-menu">
      <button type="button">
        <VegaIcon
          name={VegaIconNames.KEBAB}
          size={vertical ? 24 : undefined}
          className={vertical ? 'rotate-90' : undefined}
        />
      </button>
    </DropdownMenuTrigger>
  );
};

type ActionMenuContentProps = React.ComponentProps<
  typeof DropdownMenuContent
> & { vertical?: boolean };

export const ActionsDropdown = ({
  vertical,
  ...props
}: ActionMenuContentProps) => {
  return (
    <DropdownMenu trigger={<ActionsDropdownTrigger vertical={vertical} />}>
      <DropdownMenuContent {...props} side="bottom" align="end" />
    </DropdownMenu>
  );
};
