import { ethers, Wallet } from 'ethers';
import { StakingBridge, Token } from '@vegaprotocol/smart-contracts';
import { gql } from 'graphql-request';
import { requestGQL } from './request';
import { createLog } from './logging';

const log = createLog('ethereum-setup');

export async function setupEthereumAccount(
  vegaPublicKey: string,
  ethWalletMnemonic: string,
  ethereumProviderUrl: string
) {
  // create provider/wallet
  const provider = new ethers.providers.JsonRpcProvider({
    url: ethereumProviderUrl,
  });

  const privateKey = Wallet.fromMnemonic(
    ethWalletMnemonic,
    getAccount()
  ).privateKey;

  // this wallet (ozone access etc) is already set up with 6 million vega (eth)
  const wallet = new Wallet(privateKey, provider);

  const vegaAsset = await getVegaAsset();
  if (!vegaAsset) {
    throw new Error('could not fetch asset');
  }

  const ethereumConfig = await getEthereumConfig();
  if (!ethereumConfig) {
    throw new Error('coult not fetch ethereum config');
  }

  const tokenContract = new Token(vegaAsset.source.contractAddress, wallet);

  log('sending approve tx');
  const approveTx = await tokenContract.approve(
    ethereumConfig.staking_bridge_contract.address,
    '100000' + '0'.repeat(18)
  );
  await approveTx.wait(1);
  log('sending approve tx: success');

  const stakingContract = new StakingBridge(
    ethereumConfig.staking_bridge_contract.address,
    wallet
  );

  const amount = '10000' + '0'.repeat(18);
  log(`sending stake tx of ${amount} to ${vegaPublicKey}`);
  const stakeTx = await stakingContract.stake(amount, vegaPublicKey);
  await stakeTx.wait(3);
  await waitForStake(vegaPublicKey);
  log(`sending stake tx: success`);
}

async function getVegaAsset() {
  const query = gql`
    {
      assetsConnection {
        edges {
          node {
            id
            symbol
            source {
              ... on ERC20 {
                contractAddress
              }
            }
          }
        }
      }
    }
  `;

  const res = await requestGQL<{
    assetsConnection: {
      edges: Array<{
        node: {
          id: string;
          symbol: string;
          source: {
            contractAddress: string;
          };
        };
      }>;
    };
  }>(query);
  return res.assetsConnection.edges
    .map((e) => e.node)
    .find((a) => a.symbol === 'VEGA');
}

async function getEthereumConfig() {
  const query = gql`
    {
      networkParameter(key: "blockchains.ethereumConfig") {
        value
      }
    }
  `;

  const res = await requestGQL<{
    networkParameter: {
      key: string;
      value: string;
    };
  }>(query);
  return JSON.parse(res.networkParameter.value);
}

function waitForStake(vegaPublicKey: string) {
  const query = gql`
    {
      party(id:"${vegaPublicKey}") {
        stakingSummary {
          currentStakeAvailable
        } 
      }
    }
  `;
  return new Promise((resolve, reject) => {
    let tick = 1;
    const interval = setInterval(async () => {
      log(`confirming stake (attempt: ${tick})`);
      if (tick >= 60) {
        clearInterval(interval);
        reject(new Error('stake link never seen'));
      }

      try {
        const res = await requestGQL<{
          party: {
            stakingSummary: {
              currentStakeAvailable: string;
            };
          };
        }>(query);

        if (
          res.party?.stakingSummary?.currentStakeAvailable !== null &&
          parseInt(res.party.stakingSummary.currentStakeAvailable) > 0
        ) {
          log(
            `stake confirmed (amount: ${res.party.stakingSummary.currentStakeAvailable})`
          );
          clearInterval(interval);
          resolve(res.party.stakingSummary.currentStakeAvailable);
        }
      } catch (err) {
        // no op, query will error until party is created
      }

      tick++;
    }, 1000);
  });
}

// derivation path
const getAccount = (number = 0) => `m/44'/60'/0'/0/${number}`;
