Feature: Withdrawals to eth wallet

  Background:
    Given I can connect to Ethereum
    And I navigate to withdrawal page
    And I connect to Vega Wallet

  Scenario: Succesfull withdrawal
    When I succesfully fill in and submit withdrawal form
    Then withdrawal modal is displayed

  Scenario: Error displayed when fields are empty
    When I clear ethereum address
    And click submit
    Then errors are displayed for empty fields

  Scenario: Error displayed when invalid Ethereum address is entered
    When I enter an invalid ethereum address
    Then error for invalid ethereum address is displayed

  Scenario: Error displayed when not in range of acceptable amount
    When I enter the following details in withdrawal form
      | asset  | tUSDC TEST |
      | amount | 0          |
    Then error for below minumum amount is displayed
    When I enter the following details in withdrawal form
      | asset  | tUSDC TEST |
      | amount | 1          |
    Then error for above maximum amount is displayed

  Scenario: Fill in amount using maximum
    When I select "tDAI TEST"
    And ethereum address is connected Ethereum wallet
    And I click Use maximum
    Then expected amount is "5.00000"

  Scenario: Able to view history of withdrawals on withdrawals page
    Given I navigate to withdrawals page
    Then history of withdrawals are displayed

  Scenario: Vega wallet connect text shown when Vega wallet is disconnected
    When I disconnect my Vega wallet
    Then connect to Vega wallet is displayed

  @manual
  Scenario: Can see pending / unfinished withdrawals
    Given I am on the withdrawals page
    And I can see there are unfinished withdrawals
    And I can see the complete withdrawals button

  # Needs capsule
  @manual
  Scenario: Finish withdrawal to eth wallet
    Given I am on the withdrawals page
    And I can see there are unfinished withdrawals
    And I click on an unfinished withdrawal button
    Then I approve transaction on ethereum
    Then I can see the withdrawal button state has changed to pending
    When The transaction is complete
    Then My balance has been updated

  @manual
  Scenario: Withdrawals after chain reset
    Given I am on the withdrawals page
    And I previously had withdrawals
    And There has been a chain reset
    Then There should be no incomplete withdrawals
