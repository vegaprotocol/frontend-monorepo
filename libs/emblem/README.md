# Emblem

Uses https://icon.vega.xyz to source an image for icons, either by asset & vega chain ID or contract & source chain ID

## Components

All of the components ultimately render an [`img`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img) tag, and all properties can be overriden.

### Emblem

Wrapper component for [EmblemByAsset](#emblembyasset) and [EmblemByContract](#emblembycontract). Depending on the props, it returns an icon for an asset by one of the below subcomponents

| Property Name   | Required or Optional | Description                                                      |
| --------------- | -------------------- | ---------------------------------------------------------------- |
| asset           | Required             | The ID of the Vega Asset.                                        |
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

## Building

Run `nx build emblem` to build the library.
