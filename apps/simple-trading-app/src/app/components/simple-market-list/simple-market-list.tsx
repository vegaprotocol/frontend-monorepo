import React, { useCallback, useMemo } from 'react';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Lozenge } from '@vegaprotocol/ui-toolkit';
import { Button } from '@vegaprotocol/ui-toolkit';
import {
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SimpleMarketPercentChange from './simple-market-percent-change';
import DataProvider from './data-provider';
import { MARKET_STATUS } from './constants';

const SimpleMarketList = () => {
  const variables = useMemo(
    () => ({
      CandleInterval: 'I1H',
      CandleSince: new Date(Date.now() - 24 * 60 * 60 * 1000).toJSON(),
    }),
    []
  );
  const { data, error, loading } = useDataProvider(
    DataProvider,
    undefined,
    variables
  );
  const onClick = useCallback((marketId) => {
    // trigger navigation soon
    console.log('trigger market', marketId);
  }, []);
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <List>
        {data?.map((market) => (
          <ListItem
            key={market.id}
            secondaryAction={
              <ListItemButton>
                <ListItemIcon>
                  <Button
                    onClick={() => onClick(market.id)}
                    variant="inline"
                    prependIconName="chevron-right"
                  />
                </ListItemIcon>
              </ListItemButton>
            }
          >
            <ListItemText
              primary={
                <Grid container spacing={2}>
                  <Grid
                    item
                    container
                    xs={6}
                    direction="column"
                    justifyContent="space-evenly"
                    spacing={0.5}
                  >
                    <Grid item>{market.name}</Grid>
                    <Grid item>
                      {market.data?.auctionEnd
                        ? `${t('expires')} ${market.data?.auctionEnd}`
                        : t('not started yet')}
                    </Grid>
                    <Grid item>
                      {`${t('settled in')} ${
                        market.tradableInstrument.instrument.product
                          .settlementAsset.symbol
                      }`}
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    container
                    xs={4}
                    direction="column"
                    justifyContent="space-evenly"
                    alignItems="center"
                    spacing={1}
                  >
                    <Grid item>
                      <SimpleMarketPercentChange candles={market.candles} />
                    </Grid>
                    <Grid item>
                      <Lozenge
                        variant={MARKET_STATUS[market.data?.market.state || '']}
                      >
                        {market.data?.market.state}
                      </Lozenge>
                    </Grid>
                  </Grid>
                </Grid>
              }
            />
          </ListItem>
        ))}
      </List>
    </AsyncRenderer>
  );
};

export default SimpleMarketList;
