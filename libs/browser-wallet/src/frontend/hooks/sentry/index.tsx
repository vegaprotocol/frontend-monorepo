/* istanbul ignore file */

// import { close, init, setTag } from '@sentry/react'
// import { useEffect } from 'react'

// import config from '!/config'
// import { useNetwork } from '@/contexts/network/network-context'
// import { useGlobalsStore } from '@/stores/globals'
// import { useWalletStore } from '@/stores/wallets'

// import { sanitizeEvent } from '../../../lib/sanitize-event.js'

// export const useSentry = () => {
//   const { network } = useNetwork()
//   const { globals } = useGlobalsStore((state) => ({
//     globals: state.globals
//   }))
//   const { wallets } = useWalletStore((state) => ({
//     wallets: state.wallets
//   }))

//   useEffect(() => {
//     if (globals?.settings.telemetry && config.sentryDsn) {
//       init({
//         release: `@vegaprotocol/vegawallet-browser@${globals.version}`,
//         dsn: config.sentryDsn,
//         integrations: [],
//         /* istanbul ignore next */

//         beforeSend(event) {
//           /* istanbul ignore next */
//           return sanitizeEvent(
//             event,
//             wallets.map((wallet) => wallet.name),
//             wallets.flatMap((w) => w.keys.map((k) => k.publicKey))
//           )
//         }
//       })
//       setTag('version', globals.version)
//       setTag('network', network.chainId)
//     } else {
//       close()
//     }
//     return () => {
//       close()
//     }
//   }, [globals?.settings.telemetry, globals?.version, network.chainId, network.name, wallets])
// }
export const useSentry = () => {};
