import React from 'react';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import {
  AsyncRenderer,
  Lozenge,
  TailwindIntents,
} from '@vegaprotocol/ui-toolkit';
import { Button } from '@vegaprotocol/ui-toolkit';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DataProvider from './data-provider';
import { Grid } from '@mui/material';

const SimpleMarketList = () => {
  const { data, error, loading } = useDataProvider(DataProvider);
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <List
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Marked list
          </ListSubheader>
        }
      >
        {data?.map((market) => (
          <ListItem
            key={market.id}
            secondaryAction={
              <ListItemButton>
                <ListItemIcon>
                  <Button variant="inline" prependIconName="chevron-right" />
                </ListItemIcon>
              </ListItemButton>
            }
          >
            <ListItemText
              primary={
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <span>{market.name}</span>
                  </Grid>
                  <Grid item xs={8}>
                    <span>expires: ??</span>
                  </Grid>
                  <Grid item xs={4}>
                    <span>xs=4</span>
                  </Grid>
                  <Grid item xs={4}>
                    <span>
                      settled in{' '}
                      {
                        market.tradableInstrument.instrument.product
                          .settlementAsset.symbol
                      }
                    </span>
                  </Grid>
                  <Grid item xs={8}>
                    <span>xs=8</span>
                  </Grid>
                </Grid>
              }
            />
            <ListItemText
              primary={
                <Lozenge variant={TailwindIntents.Success}>
                  {market.data?.market.state}
                </Lozenge>
              }
            />
          </ListItem>
        ))}
      </List>
    </AsyncRenderer>
  );
};

export default SimpleMarketList;
