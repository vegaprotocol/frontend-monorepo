import { gql, useQuery } from '@apollo/client';
import { Interval } from '@vegaprotocol/types';
import { AsyncRenderer, Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { mapDataToMarketList } from './utils';

const MARKETS_QUERY = gql`
  query MarketList($interval: Interval!, $since: String!) {
    markets {
      id
      decimalPlaces
      tradableInstrument {
        instrument {
          name
          code
        }
      }
      marketTimestamps {
        open
      }
      candles(interval: $interval, since: $since) {
        open
        close
      }
    }
  }
`;

export const LandingDialog = () => {
  const [open, setOpen] = useState(true);
  const setClose = () => setOpen(false);

  const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const yTimestamp = new Date(yesterday * 1000).toISOString();

  const { data, loading, error } = useQuery(MARKETS_QUERY, {
    variables: { interval: Interval.I1H, since: yTimestamp },
  });

  if (data) {
    const marketList = mapDataToMarketList(data);
    console.log(marketList);
  }

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
            <div className="relative top-0 left-[calc(50vw_-_200px)] w-[400px] my-[10vh] mx-0 z-30 border-solid border-2">
              <div className="pt-0 px-20 pb-20">{}</div>
            </div>
          }
        </Dialog>
      }
    </AsyncRenderer>
  );
};
