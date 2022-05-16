import { gql, useQuery } from '@apollo/client';
import { AsyncRenderer, Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';

const MARKETS_QUERY = gql`
  query Markets {
    markets {
      marketTimestamps {
        open
      }
    }
  }
`;

export const LandingDialog = () => {
  const { data, loading, error } = useQuery(MARKETS_QUERY);
  const [open, setOpen] = useState(true);
  const setClose = () => setOpen(false);
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {
        <Dialog
          title="Select a market to get started"
          intent={Intent.Prompt}
          open={open}
          onChange={setClose}
        >
          {
            <div className="relative top-0 left-[calc(50vw_-_200px)] w-[400px] my-[10vh] mx-0 z-30 border-solid border-2 border-indigo-600">
              <div className="pt-0 px-20 pb-20">
                {data &&
                  data.markets.map((market: { marketTimestamp: string }) => {
                    return market.marketTimestamp;
                  })}
              </div>
            </div>
          }
        </Dialog>
      }
    </AsyncRenderer>
  );
};
