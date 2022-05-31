import {
  DealTicketManager,
  DealTicketContainer as Container,
} from '@vegaprotocol/deal-ticket';
import { DealTicketSteps } from './deal-ticket-steps';
import { useParams } from 'react-router-dom';

export const DealTicketContainer = () => {
  const { marketId } = useParams();
  return (
    <Container marketId={marketId as string}>
      {(data) => (
        <DealTicketManager market={data.market}>
          <DealTicketSteps market={data.market} />
        </DealTicketManager>
      )}
    </Container>
  );
};
