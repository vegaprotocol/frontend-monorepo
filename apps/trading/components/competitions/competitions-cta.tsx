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
  <div className="grid grid-rows-3 grid-cols-1 md:grid-rows-1 md:grid-cols-3 gap-6 mb-12">
    {children}
  </div>
);

export const CompetitionsAction = ({
  variant,
  title,
  description,
  actionElement,
  children,
}: {
  variant: ComponentProps<typeof DudeBadge>['variant'];
  title: string;
  description?: string;
  actionElement: ReactNode;
  children?: ReactNode;
}) => {
  return (
    <Box>
      <DudeBadge variant={variant} />
      <h2 className="text-2xl">{title}</h2>
      {description && <p className="text-muted">{description}</p>}
      {actionElement}
    </Box>
  );
};
