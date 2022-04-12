Feature: Deposits to vega wallet

  Background:
    Given I navigate to deposits page

  @todo
  Scenario: Eth wallet connect message displayed if no ethereum wallet connected
    Then I can see a message stating no wallet is connected
    And the connect button is displayed

  @todo
  Scenario Outline: user cannot deposit if approval amount is 0 (approval amount is 0)
    And I connect my ethereum wallet
    And I connect my vega wallet
    When I set "0" tokens to be approved
    And I approve the asset tokens
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value    |
      | To (Vega key) | xxxxxxxx |
      | Amount        | 50       |
    And I click to the deposit the funds
    And I approve the ethereum transaction
    Then I can see the deposit is unsuccessful

  @todo
  Scenario: user cannot deposit if approval amount is lower than deposit ()
    When I set "2" tokens to be approved
    And I approve the asset tokens
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value    |
      | To (Vega key) | xxxxxxxx |
      | Amount        | 50       |
    And I click to the deposit the funds
    And I approve the ethereum transaction
    Then I can see the deposit is unsuccessful
    When I set "2" tokens to be approved
    And i try to deposit "5" vega

  @todo
  Scenario: User can succesfully deposit (approval amount is greater than deposit)
    When I set "200000000" tokens to be approved
    And I approve the asset tokens
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value    |
      | To (Vega key) | xxxxxxxx |
      | Amount        | 50       |
    And I click to the deposit the funds
    And I approve the ethereum transaction
    Then I can see the deposit is Successfull
    And Balance is updated to reflect deposit amount

  @todo
  Scenario: validation errors where no fields are filled in
    When I submit a deposit form with empty fields
    Then I can see validation errors present

  @todo
  Scenario: Deposit maximum amount you have in the wallet for a given asset
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value    |
      | To (Vega key) | xxxxxxxx |
      | Amount        | 0        |
    When I click the use maximum button
    Then I can see the field is updated with the maximum amount of the asset from my wallet

  @todo
  Scenario: transaction fails if attempting to deposit more than available in wallet
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value    |
      | To (Vega key) | xxxxxxxx |
      | Amount        | 60000000 |
    And I click to the deposit the funds
    Then an error message is shown stating not enough tokens in wallet to deposit

  @todo
  Scenario: deposit to a vega wallet key which is not your own
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value                      |
      | To (Vega key) | VEGA KEY of another wallet |
      | Amount        | 50                         |
    And I click to the deposit the funds
    And I approve the ethereum transaction
    Then I can see the deposit is Successfull
    And Balance is updated to reflect deposit amount

  @todo
  Scenario: deposit when wallet is not connected
    And I disconnect my vega wallet
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value    |
      | To (Vega key) | xxxxxxxx |
      | Amount        | 50       |
    And I click to the deposit the funds
    And I approve the ethereum transaction
    Then I can see the deposit is unsuccessful

