import React, { useState } from 'react';
import useWebSocket from 'react-use-websocket';

import { SplashScreen } from '../../components/splash-screen';
import { DATA_SOURCES } from '../../config';
import { TendermintWebsocketContext } from './tendermint-websocket-context';
import { Loader } from '@vegaprotocol/ui-toolkit';

/**
 * Provides a single, shared, websocket instance to the entire app to prevent recreation on every render
 */
export const TendermintWebsocketProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [socketUrl] = useState(DATA_SOURCES.tendermintWebsocketUrl);
  const contextShape = useWebSocket(socketUrl);

  if (!contextShape) {
    return (
      <SplashScreen>
        <Loader />
      </SplashScreen>
    );
  }

  return (
    <TendermintWebsocketContext.Provider value={{ ...contextShape }}>
      {children}
    </TendermintWebsocketContext.Provider>
  );
};
