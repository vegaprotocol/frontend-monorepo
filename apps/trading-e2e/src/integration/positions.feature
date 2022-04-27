Feature: Positions
  Scenario: Positions displayed
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I click on positions tab
    Then positions are displayed