declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      get_network_parameters(): Chainable<networkParameters>;
    }
  }
}

export function addGetNetworkParameters() {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  Cypress.Commands.add('get_network_parameters', () => {
    const mutation = `
  {
    networkParametersConnection {
      edges {
        node {
          key
          value
        }
      }
    }
  }`;
    cy.request({
      method: 'POST',
      url: `http://localhost:3008/graphql`,
      body: {
        query: mutation,
      },
      headers: { 'content-type': 'application/json' },
    })
      .its('body.data.networkParametersConnection.edges')
      .then(function (response) {
        // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
        const object = response.reduce(function (r, e) {
          const { value, key } = e.node;
          r[key] = value;
          return r;
        }, {});
        return cy.wrap(object);
      });
  });
}

interface networkParameters {
  'blockchains.ethereumConfig': string;
  'governance.proposal.asset.maxClose': string;
  'governance.proposal.asset.maxEnact': string;
  'governance.proposal.asset.minClose': string;
  'governance.proposal.asset.minEnact': string;
  'governance.proposal.asset.minProposerBalance': string;
  'governance.proposal.asset.minVoterBalance': string;
  'governance.proposal.asset.requiredMajority': string;
  'governance.proposal.asset.requiredParticipation': string;
  'governance.proposal.freeform.maxClose': string;
  'governance.proposal.freeform.minClose': string;
  'governance.proposal.freeform.minProposerBalance': string;
  'governance.proposal.freeform.minVoterBalance': string;
  'governance.proposal.freeform.requiredMajority': string;
  'governance.proposal.freeform.requiredParticipation': string;
  'governance.proposal.market.maxClose': string;
  'governance.proposal.market.maxEnact': string;
  'governance.proposal.market.minClose': string;
  'governance.proposal.market.minEnact': string;
  'governance.proposal.market.minProposerBalance': string;
  'governance.proposal.market.minVoterBalance': string;
  'governance.proposal.market.requiredMajority': string;
  'governance.proposal.market.requiredParticipation': string;
  'governance.proposal.updateAsset.maxClose': string;
  'governance.proposal.updateAsset.maxEnact': string;
  'governance.proposal.updateAsset.minClose': string;
  'governance.proposal.updateAsset.minEnact': string;
  'governance.proposal.updateAsset.minProposerBalance': string;
  'governance.proposal.updateAsset.minVoterBalance': string;
  'governance.proposal.updateAsset.requiredMajority': string;
  'governance.proposal.updateAsset.requiredParticipation': string;
  'governance.proposal.updateMarket.maxClose': string;
  'governance.proposal.updateMarket.maxEnact': string;
  'governance.proposal.updateMarket.minClose': string;
  'governance.proposal.updateMarket.minEnact': string;
  'governance.proposal.updateMarket.minProposerBalance': string;
  'governance.proposal.updateMarket.minProposerEquityLikeShare': string;
  'governance.proposal.updateMarket.minVoterBalance': string;
  'governance.proposal.updateMarket.requiredMajority': string;
  'governance.proposal.updateMarket.requiredMajorityLP': string;
  'governance.proposal.updateMarket.requiredParticipation': string;
  'governance.proposal.updateMarket.requiredParticipationLP': string;
  'governance.proposal.updateNetParam.maxClose': string;
  'governance.proposal.updateNetParam.maxEnact': string;
  'governance.proposal.updateNetParam.minClose': string;
  'governance.proposal.updateNetParam.minEnact': string;
  'governance.proposal.updateNetParam.minProposerBalance': string;
  'governance.proposal.updateNetParam.minVoterBalance': string;
  'governance.proposal.updateNetParam.requiredMajority': string;
  'governance.proposal.updateNetParam.requiredParticipation': string;
  'limits.assets.proposeEnabledFrom': string;
  'limits.markets.maxPeggedOrders': string;
  'limits.markets.proposeEnabledFrom': string;
  'market.auction.maximumDuration': string;
  'market.auction.minimumDuration': string;
  'market.fee.factors.infrastructureFee': string;
  'market.fee.factors.makerFee': string;
  'market.liquidity.bondPenaltyParameter': string;
  'market.liquidity.maximumLiquidityFeeFactorLevel': string;
  'market.liquidity.minimum.probabilityOfTrading.lpOrders': string;
  'market.liquidity.probabilityOfTrading.tau.scaling': string;
  'market.liquidity.providers.fee.distributionTimeStep': string;
  'market.liquidity.stakeToCcyVolume': string;
  'market.liquidity.targetstake.triggering.ratio': string;
  'market.liquidityProvision.minLpStakeQuantumMultiple': string;
  'market.liquidityProvision.shapes.maxSize': string;
  'market.margin.scalingFactors': string;
  'market.monitor.price.defaultParameters': string;
  'market.stake.target.scalingFactor': string;
  'market.stake.target.timeWindow': string;
  'market.value.windowLength': string;
  'network.checkpoint.timeElapsedBetweenCheckpoints': string;
  'network.floatingPointUpdates.delay': string;
  'network.markPriceUpdateMaximumFrequency': string;
  'network.transaction.defaultgas': string;
  'network.transactions.maxgasperblock': string;
  'network.transactions.minBlockCapacity': string;
  'network.validators.ersatz.multipleOfTendermintValidators': string;
  'network.validators.ersatz.rewardFactor': string;
  'network.validators.incumbentBonus': string;
  'network.validators.minimumEthereumEventsForNewValidator': string;
  'network.validators.multisig.numberOfSigners': string;
  'network.validators.tendermint.number': string;
  'reward.asset': string;
  'reward.staking.delegation.competitionLevel': string;
  'reward.staking.delegation.delegatorShare': string;
  'reward.staking.delegation.maxPayoutPerEpoch': string;
  'reward.staking.delegation.maxPayoutPerParticipant': string;
  'reward.staking.delegation.minValidators': string;
  'reward.staking.delegation.minimumValidatorStake': string;
  'reward.staking.delegation.optimalStakeMultiplier': string;
  'reward.staking.delegation.payoutDelay': string;
  'reward.staking.delegation.payoutFraction': string;
  'rewards.marketCreationQuantumMultiple': string;
  'snapshot.interval.length': string;
  'spam.pow.difficulty': string;
  'spam.pow.hashFunction': string;
  'spam.pow.increaseDifficulty': string;
  'spam.pow.numberOfPastBlocks': string;
  'spam.pow.numberOfTxPerBlock': string;
  'spam.protection.delegation.min.tokens': string;
  'spam.protection.max.batchSize': string;
  'spam.protection.max.delegations': string;
  'spam.protection.max.proposals': string;
  'spam.protection.max.votes': string;
  'spam.protection.maxUserTransfersPerEpoch': string;
  'spam.protection.minMultisigUpdates': string;
  'spam.protection.minimumWithdrawalQuantumMultiple': string;
  'spam.protection.proposal.min.tokens': string;
  'spam.protection.voting.min.tokens': string;
  'transfer.fee.factor': string;
  'transfer.minTransferQuantumMultiple': string;
  'validator.performance.scaling.factor': string;
  'validators.delegation.minAmount': string;
  'validators.epoch.length': string;
  'validators.vote.required': string;
}
