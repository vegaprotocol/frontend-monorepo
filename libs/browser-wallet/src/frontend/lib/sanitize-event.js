export const sanitizeEvent = (event, walletNames, publicKeys) => {
  let eventString = JSON.stringify(event)
  walletNames.forEach((name) => {
    eventString = eventString.replaceAll(name, '[WALLET_NAME]')
  })
  publicKeys.forEach((key) => {
    eventString = eventString.replaceAll(key, '[VEGA_KEY]')
  })
  const sanitizedEvent = JSON.parse(eventString)
  return sanitizedEvent
}
