import { ethers, Wallet } from 'ethers';
import { StakingBridge, Token } from '@vegaprotocol/smart-contracts';
import { gql } from 'graphql-request';
import { requestGQL } from './request';

const MNEMONIC =
  'ozone access unlock valid olympic save include omit supply green clown session';

export async function setupEthereumAccount(vegaPublicKey: string) {
  // create provider/wallet
  const provider = new ethers.providers.JsonRpcProvider({
    url: 'http://localhost:8545',
  });

  const privateKey = Wallet.fromMnemonic(MNEMONIC, getAccount()).privateKey;

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
  log(`staking ${amount}`);
  const stakeTx = await stakingContract.stake(amount, vegaPublicKey);
  await stakeTx.wait(3);
  log(`staking ${amount}: success`);

  log('waiting for stake');
  await waitForStake(vegaPublicKey);
  log('waiting for stake: success');
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
    let tick = 0;
    const interval = setInterval(async () => {
      if (tick >= 10) {
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
          clearInterval(interval);
          resolve(res.party.stakingSummary.currentStakeAvailable);
        }
      } catch (err) {
        console.log(err);
      }

      tick++;
    }, 1000);
  });
}
// derivation path
const getAccount = (number = 0) => `m/44'/60'/0'/0/${number}`;

const log = (message: string) => {
  console.log(`[ethereum-setup]: ${message}`);
};
