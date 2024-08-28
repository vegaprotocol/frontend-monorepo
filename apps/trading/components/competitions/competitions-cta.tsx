import { Box } from './box';
import { type ReactElement, type ReactNode } from 'react';
import { Tooltip, Button, type ButtonProps } from '@vegaprotocol/ui-toolkit';

export const CompetitionsActionsContainer = ({
  children,
}: {
  children:
    | ReactElement<typeof CompetitionsAction>
    | Iterable<ReactElement<typeof CompetitionsAction>>;
}) => (
  <div
    className="grid grid-cols-1 md:grid-cols-3 grid-rows-4'
 gap-6 mb-12"
  >
    {children}
  </div>
);

export const CompetitionsAction = ({
  title,
  description,
  actionElement,
}: {
  title: string;
  description?: string;
  actionElement: ReactNode;
}) => {
  return (
    <Box className="grid md:grid-rows-[subgrid] gap-6 row-span-3 text-center">
      <h2 className="text-2xl">{title}</h2>
      {description && <p className="text-surface-1-fg-muted">{description}</p>}
      <div className="flex justify-center">{actionElement}</div>
    </Box>
  );
};

export const ActionButton = ({
  tooltip,
  ...buttonProps
}: ButtonProps & {
  tooltip?: string;
}) => (
  <Tooltip description={tooltip}>
    <Button {...buttonProps} />
  </Tooltip>
);
