import {
  DealTicketType,
  useDealTicketTypeStore,
} from '../../hooks/use-type-store';
import { DealTicketContainer } from './deal-ticket-container';
import type { DealTicketContainerProps } from './deal-ticket-container';
import { StopOrderContainer } from './deal-ticket-stop-order';

export const DealTicketSelector = (props: DealTicketContainerProps) => {
  const type = useDealTicketTypeStore((state) => state.type[props.marketId]);
  return type === DealTicketType.StopLimit ||
    type === DealTicketType.StopMarket ? (
    <StopOrderContainer marketId={props.marketId} />
  ) : (
    <DealTicketContainer {...props} />
  );
};
