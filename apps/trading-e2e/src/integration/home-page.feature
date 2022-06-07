Feature: Home page

  Background:
    Given I am on the homepage
    And I query the server for Open Markets
    When the server contains at least 6 open markets

  Scenario: Choose market overlay: prompted to choose market
    Then I am prompted to select a market

  Scenario: Choose market overlay: oldest currently trading market shown in background by default
    Then the oldest current trading market is loaded on the trading tab

  Scenario: Choose market overlay: contains at least 6 listed markets
    Then I expect the market overlay table to contain at least 6 rows 

  Scenario: Choose market overlay: each listed item reflects an open market
    Then each market shown in overlay table exists as open market on server
  
  Scenario: Choose market overlay: each listed item contains values for last price and change
    Then each market shown in overlay table contains content under the last price and change fields
  
  Scenario: Choose market overlay: oldest trading market appears at top of list
    Then the oldest market trading in continous mode shown at top of overlay table

  Scenario: Choose market overlay: can be closed without choosing an option
    When I close the dialog form
    And the choose market overlay is no longer showing
    Then the oldest current trading market is loaded on the trading tab

  Scenario: Choose market overlay: clicking a market name will load that market
    When I click the most recent trading market
    And the choose market overlay is no longer showing
    Then the most recent current trading market is loaded on the trading tab

  Scenario: Choose market overlay: full market list: clicking the full market list shows all open markets
    When I click the view full market list
    And the choose market overlay is no longer showing
    Then each market shown in the full list exists as open market on server

  Scenario: Choose market overlay: full market list: clicking a market name will load that market
    When I click the view full market list
    And the choose market overlay is no longer showing
    When I click the most recent trading market
    Then the most recent current trading market is loaded on the trading tab

  Scenario: Navigation: Visit Portfolio page
    And I navigate to portfolio page

  Scenario: Navigation: Visit Markets page
    And I navigate to markets page

  Scenario: Vega Wallett Overlay: Able to switch public key for connected Vega wallet
    Given I connect to Vega Wallet
    When I open wallet dialog
    And select a different public key
    Then public key is switched

  Scenario: Vega Wallett Overlay: Unable to connect Vega wallet with incorrect credentials
    When I try to connect Vega wallet with incorrect details
    Then wallet not running error message is displayed

  Scenario: Vega Wallett Overlay: Unable to connect Vega wallet with blank fields
    When I try to connect Vega wallet with blank fields
    Then wallet field validation errors are shown