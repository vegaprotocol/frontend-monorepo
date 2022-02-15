import React, { useState } from "react";
import useWebSocket from "react-use-websocket";

import { SplashLoader } from "../../components/splash-loader";
import { SplashScreen } from "../../components/splash-screen";
import { DATA_SOURCES } from "../../config";
import { TendermintWebsocketContext } from "./tendermint-websocket-context";

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
        <SplashLoader />
      </SplashScreen>
    );
  }

  return (
    <TendermintWebsocketContext.Provider value={{ ...contextShape }}>
      {children}
    </TendermintWebsocketContext.Provider>
  );
};
