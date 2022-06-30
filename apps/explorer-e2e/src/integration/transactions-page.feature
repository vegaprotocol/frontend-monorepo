@ignore
# tendermint times out getting txs on testnet atm
Feature: Transactions Page

  Scenario: Navigate to transactions page
    Given I am on the homepage
    When I navigate to the transactions page
    Then transactions page is correctly displayed

  Scenario: Navigate to transaction details page
    Given I am on the homepage
    When I navigate to the transactions page
    And I click on the top transaction
    Then transaction details are displayed

  Scenario: Navigate to transactions page using mobile
    Given I am on mobile and open the toggle menu
    When I navigate to the transactions page
    Then transactions page is correctly displayed
    When I click on the top transaction
    Then transaction details are displayed
