import type { DealTicketContainerProps } from '@vegaprotocol/deal-ticket';
import {
  DealTicketManager,
  DealTicketContainer as Container,
} from '@vegaprotocol/deal-ticket';
import { DealTicketSteps } from './deal-ticket-steps';

export const DealTicketContainer = ({ marketId }: DealTicketContainerProps) => {
  return (
    <Container marketId={marketId}>
      {(data) => (
        <DealTicketManager market={data.market}>
          <DealTicketSteps market={data.market} />
        </DealTicketManager>
      )}
    </Container>
  );
};
