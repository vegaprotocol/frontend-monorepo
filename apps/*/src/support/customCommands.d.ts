declare namespace Cypress {
  interface Chainable<Subject> {
    stakingPage_getValidatorNamesSorted(): Chainable<any>;
    stakingValidatorPage_check_stakeNextEpochValue(
      expectedVal: any
    ): Chainable<any>;
    staking_waitForEpochRemainingSeconds(secondsRemaining: any): Chainable<any>;
    walletVega_connect(): Chainable<any>;
    walletVega_getUnstakedAmount(): Chainable<any>;
    walletVega_checkValidator_StakeNextEpochValue(
      validatorName: any,
      expectedVal: any
    ): Chainable<any>;
    walletVega_check_UnstakedValue_is(expectedVal: any): Chainable<any>;
  }
}
