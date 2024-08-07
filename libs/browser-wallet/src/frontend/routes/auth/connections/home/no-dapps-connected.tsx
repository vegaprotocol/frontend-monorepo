export const locators = {
  connectionsNoConnections: 'connections-no-connections',
};

export const NoAppsConnected = () => {
  return (
    <div data-testid={locators.connectionsNoConnections}>
      <p className="text-sm">Your wallet is not connected to any dapps.</p>
    </div>
  );
};
