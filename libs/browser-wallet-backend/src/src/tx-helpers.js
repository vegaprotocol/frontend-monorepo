import * as InputData from '@vegaprotocol/protos/vega/commands/v1/InputData/encode'
import * as Transaction from '@vegaprotocol/protos/vega/commands/v1/Transaction/encode'
import { TX_VERSION_V3 } from '@vegaprotocol/protos/vega/commands/v1/TxVersion'
import { toBase64, toHex } from '@vegaprotocol/crypto/buf'
import { randomFill } from '@vegaprotocol/crypto/crypto'

import solvePoW from './pow.js'

export async function getChainId({ rpc }) {
  const latestBlock = await rpc.blockchainHeight()

  return latestBlock.chainId
}

export async function createTransactionData({ rpc, keys, transaction }) {
  const latestBlock = await rpc.blockchainHeight()
  const tid = toHex(await randomFill(new Uint8Array(32)))

  const pow = await solvePoW({
    difficulty: latestBlock.spamPowDifficulty,
    blockHash: latestBlock.hash,
    tid
  })

  const nonce = new DataView(await randomFill(new Uint8Array(8)).buffer).getBigUint64(0, false)

  const inputData = InputData.encode({
    blockHeight: BigInt(latestBlock.height),
    nonce,
    command: transaction
  })

  const chainId = latestBlock.chainId

  const txData = {
    inputData,
    signature: {
      value: toHex(await keys.sign(inputData, chainId)),
      algo: keys.algorithm.name,
      version: keys.algorithm.version
    },
    from: {
      pubKey: keys.publicKey.toString()
    },
    version: TX_VERSION_V3,
    pow
  }

  const tx = Transaction.encode(txData)

  const txJSON = {
    inputData: toBase64(inputData),
    signature: {
      value: txData.signature.value,
      algo: txData.signature.algo,
      version: txData.signature.version
    },
    from: {
      pubKey: txData.from.pubKey
    },
    version: txData.version,
    pow: {
      tid: toHex(tid),
      nonce: pow.nonce.toString()
    }
  }

  const base64Tx = await toBase64(tx)

  return {
    tx,
    base64Tx,
    txJSON
  }
}

export async function sendTransaction({ rpc, keys, transaction, sendingMode }) {
  const txData = await createTransactionData({ rpc, keys, transaction })
  const sentAt = new Date().toISOString()
  const res = await rpc.submitRawTransaction(txData.base64Tx, sendingMode)

  return {
    sentAt,
    transactionHash: res.txHash,
    transaction: txData.txJSON
  }
}

export function getTransactionType(tx) {
  return Object.keys(tx)[0]
}

export async function checkTransaction({ rpc, keys, transaction }) {
  const txData = await createTransactionData({ rpc, keys, transaction })
  try {
    const res = await rpc.checkRawTransaction(txData.base64Tx)
    return {
      valid: res.success,
      transaction: txData.txJSON,
      error: null
    }
  } catch (err) {
    return {
      valid: false,
      transaction: txData.txJSON,
      error: err.message
    }
  }
}
