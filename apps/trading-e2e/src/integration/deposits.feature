Feature: Deposits to vega wallet

  Background:
    Given I navigate to deposits page

  # wallet is already connected before tests start and doesn't prompt the disconnected state
  @ignore
  Scenario: Connecting Ethereum wallet
    Then I can see the eth not connected message "Connect your Ethereum wallet"
    And the connect button is displayed
    When I connect my Ethereum wallet
    Then I can see the deposit form

  @todo
  Scenario: Cannot deposit if approved amount is 0 (approval amount is 0)
    And I connect my Ethereum wallet
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
  # The following step is valid and are commented out as currently it cannot be automated
  # Then I can see the deposit is unsuccessful

  @todo
  Scenario: Cannot deposit if approved amount is lower than deposit amount
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
  # The following step is valid and are commented out as currently it cannot be automated
  # Then I can see the deposit is unsuccessful

  @todo
  Scenario: Can succesfully deposit (approved amount is greater than deposit)
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
  # The following steps are valid and are commented out as currently they cannot be automated
  # Then I can see the deposit is Successfull
  # And Balance is updated to reflect deposit amount

  Scenario: Empty form Validation errors
    When I submit a deposit with empty fields
    Then I can see empty form validation errors present

  Scenario: Invalid deposit public key validation error
    When I enter the following deposit details in deposit form
      | asset  | tBTC TEST               |
      | to     | invalidDepositToAddress |
      | amount | 1                       |
    And I submit the form
    Then Invalid Vega key is shown

  Scenario: Deposit amount too small validation
    When I enter the following deposit details in deposit form
      | asset  | tBTC TEST                             |
      | to     | invalidDepositToAddress               |
      | amount | 0.00000000000000000000000000000000001 |
    And I submit the form
    Then Amount too small message shown

  Scenario: Deposit amount greater than approved amount validation
    When I enter the following deposit details in deposit form
      | asset  | tBTC TEST               |
      | to     | invalidDepositToAddress |
      | amount | 788888888888888         |
    And I submit the form
    And Insufficient amount message shown
  # Then Amount too small message shown
  # And I enter a valid amount
  # And I submit the form
  # This next step is being skipped due to account having approved status
  # Then Not approved message shown

  Scenario: Successful deposit
    When I enter the following deposit details in deposit form
      | asset  | tBTC TEST             |
      | to     | validDepositToAddress |
      | amount | 1                     |
    And I submit the form
    And I can see the 'deposit pending' modal is shown

  @todo
  Scenario: Use the 'Use Maximum' button to populate amount input with the balance in the connected wallet
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value    |
      | To (Vega key) | xxxxxxxx |
      | Amount        | 0        |
    When I click the use maximum button
    Then I can see the field is updated with the maximum amount of the asset from my wallet

  @todo
  Scenario: User is warned if the the amount to deposit is greater than what is available in the connected wallet"
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value    |
      | To (Vega key) | xxxxxxxx |
      | Amount        | 60000000 |
    And I click to the deposit the funds
    Then an error message is shown stating not enough tokens in wallet to deposit

  @todo
  Scenario: Deposit to a vega wallet key which is not your own
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value                      |
      | To (Vega key) | VEGA KEY of another wallet |
      | Amount        | 50                         |
    And I click to the deposit the funds
    And I approve the ethereum transaction
  # The following steps are valid and are commented out as currently they cannot be automated
  # Then I can see the deposit is Successfull
  # And Balance is updated to reflect deposit amount

  @todo
  Scenario: Deposit when vega wallet is not connected
    And I disconnect my vega wallet
    And I can see the deposit form is displayed
    And I select "" asset from the dropdown list
    When I enter the following details
      | Field         | Value    |
      | To (Vega key) | xxxxxxxx |
      | Amount        | 50       |
    And I click to the deposit the funds
    And I approve the ethereum transaction
# The following step is valid and are commented out as currently it cannot be automated
# Then I can see the deposit is unsuccessful

