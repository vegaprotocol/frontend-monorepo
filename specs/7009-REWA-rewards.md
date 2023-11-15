# Rewards page

## Reward pots

- For any asset the connected party has rewards in
  - **Must** be able to see the connected party's total reward pot for Vega (vestingBalancesSummary.locked + vestingBalancesSummary.vesting) (<a name="7009-REWA-001" href="#7009-REWA-001">7009-REWA-001</a>)
  - **Must** be able to see how much locked Vega exists for the connected party (<a name="7009-REWA-002" href="#7009-REWA-002">7009-REWA-002</a>)
  - **Must** be able to see how much vesting Vega exists for the connected party (<a name="7009-REWA-003" href="#7009-REWA-003">7009-REWA-003</a>)
  - **Must** be able to see how much rewarded Vega is available to withrdraw immediately (<a name="7009-REWA-004" href="#7009-REWA-004">7009-REWA-004</a>)

### Vega reward pot

- **Must** always see the Vega reward pot (<a name="7009-REWA-005" href="#7009-REWA-005">7009-REWA-005</a>)
- **Must** a disconnected message if not connected (<a name="7009-REWA-006" href="#7009-REWA-006">7009-REWA-006</a>)

## Vesting

- **Must** be ablet to see the computed vesting rate (baseRate \* rewardVestingMultiplier) (<a name="7009-REWA-007" href="#7009-REWA-007">7009-REWA-007</a>)
- **Must** be the vesting base rate (<a name="7009-REWA-008" href="#7009-REWA-008">7009-REWA-008</a>)
- **Must** be able to see the reward vesting multiplier (party.activityStreak.rewardVestingMultiplier) (<a name="7009-REWA-009" href="#7009-REWA-009">7009-REWA-009</a>)

## Rewards multipliers

- **Must** be able to view the streak reward multiplier (party.activityStreak.rewardDistributionMultiplier) (<a name="7009-REWA-010" href="#7009-REWA-010">7009-REWA-010</a>):
- **Must** be able to view the hoarder reward multiplier (party.vestingStats.rewardsBonusMultiplier) (<a name="7009-REWA-011" href="#7009-REWA-011">7009-REWA-011</a>):

## Reward history

- **Must** see a table showing all reward types per asset (<a name="7009-REWA-012" href="#7009-REWA-012">7009-REWA-012</a>)
  - Asset
  - Staking
  - Price taking
  - Price making
  - Liquidity provision
  - Market creation
  - Average position
  - Relative returns
  - Returns volatility
  - Validator ranking
  - Total sum of all reward types for asset
- **Must** be able to filter rewards by epoch (<a name="7009-REWA-013" href="#7009-REWA-013">7009-REWA-013</a>)
- **Must** be able to toggle between seeing all rewards and all rewards earned by the connected party (<a name="7009-REWA-014" href="#7009-REWA-014">7009-REWA-014</a>)
