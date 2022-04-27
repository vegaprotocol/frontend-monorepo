Feature: Accounts table 
  Scenario: Accounts displayed when connected to wallet
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I click on accounts tab
    Then accounts are displayed
    And I can see account for tEURO