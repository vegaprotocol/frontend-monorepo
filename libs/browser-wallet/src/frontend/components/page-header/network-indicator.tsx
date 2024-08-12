// import { getIntentBackground, type Intent, Tooltip } from '@vegaprotocol/ui-toolkit';
// import { cn } from '@vegaprotocol/ui-toolkit';

// import { useNetwork } from '@/contexts/network/network-context';
// import { useConnectionStore } from '@/stores/connections';
// import { useNetworksStore } from '@/stores/networks-store';
// import { useTabStore } from '@/stores/tab-store';

// import { CONSTANTS } from '../../lib/constants';

export const locators = {
  indicator: 'indicator',
  networkIndicatorTooltip: 'network-indicator-tooltip',
};

// const Indicator = ({ intent }: { intent: Intent }) => {
//   const background = getIntentBackground(intent);
//   return (
//     <div
//       data-testid={locators.indicator}
//       className={cn(
//         'border-1 border-vega-dark-200 border inline-block w-3 h-3 mt-1 mr-2 rounded-full text-black',
//         background
//       )}
//     />
//   );
// };

// const IndicatorWithTooltip = ({
//   intent,
//   description,
// }: {
//   description: string;
//   intent: Intent;
// }) => {
//   return (
//     <Tooltip
//       description={
//         <div
//           data-testid={locators.networkIndicatorTooltip}
//           style={{ maxWidth: CONSTANTS.width - 60 }}
//         >
//           {description}
//         </div>
//       }
//     >
//       <div>
//         <Indicator intent={intent} />
//       </div>
//     </Tooltip>
//   );
// };

// export const NetworkIndicator = () => {
//   const { network } = useNetwork();
//   const { networks } = useNetworksStore((state) => ({
//     networks: state.networks,
//   }));
//   const { currentTab } = useTabStore((state) => ({
//     currentTab: state.currentTab,
//   }));
//   const { connections, loading } = useConnectionStore((state) => ({
//     connections: state.connections,
//     loading: state.loading,
//   }));
//   if (loading) return null;
//   if (currentTab?.url && connections.length > 0) {
//     const origin = new URL(currentTab.url).origin;
//     const connection = connections.find((c) => c.origin === origin);
//     if (connection) {
//       const { chainId, networkId } = connection;
//       const connectionNetwork = networks.find((n) => n.id === networkId);
//       if (!connectionNetwork) {
//         throw new Error(
//           `Could not find network with id ${networkId} in the networks store.`
//         );
//       }
//       return network.chainId === chainId ? (
//         <IndicatorWithTooltip
//           intent={Intent.Success}
//           description={`You are currently connected to ${origin}.`}
//         />
//       ) : (
//         <IndicatorWithTooltip
//           intent={Intent.Warning}
//           description={`
//           The dApp ${origin} is connected to the ${connectionNetwork.name} network, but your wallet is displaying ${network.name} data. To change the network for your wallet, click on the network dropdown.`}
//         />
//       );
//     }
//     return (
//       <IndicatorWithTooltip
//         intent={Intent.None}
//         description={`You are not currently connected to ${origin}.`}
//       />
//     );
//   }
//   return (
//     <IndicatorWithTooltip
//       intent={Intent.None}
//       description={`You are not currently connected to any sites.`}
//     />
//   );
// };
