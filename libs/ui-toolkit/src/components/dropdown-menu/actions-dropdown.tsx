import { VegaIcon, VegaIconNames } from '../icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';

export const ActionsDropdownTrigger = () => {
  return (
    <DropdownMenuTrigger
      className='hover:bg-vega-light-200 dark:hover:bg-vega-dark-200 [&[aria-expanded="true"]]:bg-vega-light-200 dark:[&[aria-expanded="true"]]:bg-vega-dark-200 p-0.5 rounded-full'
      data-testid="dropdown-menu"
    >
      <VegaIcon name={VegaIconNames.KEBAB} />
    </DropdownMenuTrigger>
  );
};

type ActionMenuContentProps = React.ComponentProps<typeof DropdownMenuContent>;
export const ActionsDropdown = (props: ActionMenuContentProps) => {
  return (
    <DropdownMenu trigger={<ActionsDropdownTrigger />}>
      <DropdownMenuContent {...props}></DropdownMenuContent>
    </DropdownMenu>
  );
};
