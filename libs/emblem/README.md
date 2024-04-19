# Emblem

Uses https://icon.vega.xyz to source an image for assets or markets.

## Components

All of the components ultimately render an [`img`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img) tag, and all properties can be overridden.

### Emblem

Wrapper component for [EmblemByAsset](#emblembyasset), [EmblemByContract](#emblembycontract) and [EmblemByMarket](#emblembymarket) components. Depending on the props, it returns an icon for an asset by one of the below subcomponents

| Property Name   | Required or Optional | Description                                                      |
| --------------- | -------------------- | ---------------------------------------------------------------- |
| asset           | Optional             | The ID of the Vega Asset.                                        |
| chainId         | Optional             | The ID of the Vega Chain.                                        |
| vegaChainId     | Optional             | The ID of the Vega Chain (e.g. `vega-fairground-2020305051805`). |
| contractAddress | Optional             | The address of the smart contract on its origin chain.           |

### EmblemByAsset

Renders an icon for a given Vega Asset ID.

| Property Name | Required or Optional | Description                                                      |
| ------------- | -------------------- | ---------------------------------------------------------------- |
| asset         | Required             | The ID of the Vega Asset.                                        |
| vegaChainId   | Required             | The ID of the Vega Chain (e.g. `vega-fairground-2020305051805`). |

### EmblemByContract

Renders an icon for a given smart contract address on its origin chain.

| Property Name | Required or Optional | Description                                                 |
| ------------- | -------------------- | ----------------------------------------------------------- |
| contract      | Required             | The address of the contract representing the asset.         |
| chainId       | Required             | The ID of the origin chain (e.g. `1` for Ethereum Mainnet). |

### EmblemByMarket

Renders two, or optionally one icons for a given market ID on a vega chain

| Property Name | Required or Optional | Description                                                      |
| ------------- | -------------------- | ---------------------------------------------------------------- |
| vegaChainId   | Required             | The ID of the Vega Chain (e.g. `vega-fairground-2020305051805`). |
| marketId      | Required             | The ID of the market                                             |
| showLogos     | Optional             | 'BASE' or 'QUOTE' show only that asset. Defaults to 'BOTH'       |

## Vega Chain ID

Vega chain ID is required by most of the components. See Explorer's `EmblemWithChain` for an example of a wrapper component
that gets the chain ID from configuration, meaning you don't need to manually fetch the chain ID in lots of components. As this
is not standard across applications currently, it has not been added to this library.

## Building

Run `nx build emblem` to build the library.
