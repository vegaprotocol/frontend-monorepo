import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { DealTicketManager } from './deal-ticket-manager';
import { t } from '@vegaprotocol/react-helpers';
import { useDealTicketQuery } from '../';
import type { DealTicketQuery } from '../';

type childrenProps = {
  market?: DealTicketQuery['market'];
};

export interface DealTicketContainerProps {
  marketId: string;
  children?(props: childrenProps): JSX.Element;
}

export const DealTicketContainer = ({
  marketId,
  children,
}: DealTicketContainerProps) => {
  const { data, loading, error } = useDealTicketQuery({
    variables: { marketId },
  });

  return (
    <AsyncRenderer<DealTicketQuery> data={data} loading={loading} error={error}>
      {data && data.market ? (
        children ? (
          children(data)
        ) : (
          <DealTicketManager market={data.market} />
        )
      ) : (
        <Splash>
          {JSON.stringify(data)}
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};
