import { useParams } from 'react-router-dom';
import {
  DealTicketManager,
  DealTicketContainer as Container,
} from '@vegaprotocol/deal-ticket';
import { DealTicketSteps } from './deal-ticket-steps';

const tempEmptyText = <p>Please select a market from the markets page</p>;

export const DealTicketContainer = () => {
  const { marketId } = useParams<{ marketId: string }>();
  return marketId ? (
    <Container marketId={marketId}>
      {(data) => (
        <DealTicketManager market={data.market}>
          <DealTicketSteps market={data.market} />
        </DealTicketManager>
      )}
    </Container>
  ) : (
    tempEmptyText
  );
};
