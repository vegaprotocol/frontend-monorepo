// import config from '!/config'
// import { init, setTag } from '@sentry/browser'
// import { sanitizeEvent } from '../../lib/sanitize-event.js'
// import packageJson from '../../package.json'
// import uniq from 'lodash/uniq'

// export const setupSentry = async (settingsStore, publicKeyIndexStore) => {
//   if (config.sentryDsn) {
//     init({
//       dsn: config.sentryDsn,
//       release: `@vegaprotocol/vegawallet-browser@${packageJson.version}`,
//       integrations: [],
//       /* istanbul ignore next */
//       async beforeSend(event) {
//         const telemetry = await settingsStore.get('telemetry')
//         // returning null prevents the event from being sent
//         if (!telemetry) return null
//         const wallets = await publicKeyIndexStore.values()
//         const walletNames = uniq(wallets.map((w) => w.wallet))
//         const keys = uniq(wallets.map((w) => w.publicKey))

//         /* istanbul ignore next */
//         return sanitizeEvent(event, walletNames, keys)
//       }
//     })
//     setTag('version', packageJson.version)
//   }
// }
