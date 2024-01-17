import { Box } from './box';
import { type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { DudeBadge } from './graphics/dude-badge';

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
  variant,
  title,
  description,
  actionElement,
}: {
  variant: ComponentProps<typeof DudeBadge>['variant'];
  title: string;
  description?: string;
  actionElement: ReactNode;
}) => {
  return (
    <Box className="grid md:grid-rows-[subgrid] gap-6 row-span-4 text-center">
      <div className="flex justify-center">
        <DudeBadge variant={variant} />
      </div>
      <h2 className="text-2xl">{title}</h2>
      {description && <p className="text-muted">{description}</p>}
      <div className="flex justify-center">{actionElement}</div>
    </Box>
  );
};
