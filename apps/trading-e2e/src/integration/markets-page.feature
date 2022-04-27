Feature: Markets page

  Scenario: Navigation
    Given I am on the homepage
    When I navigate to markets page
    Then I can view markets
    And the market table is displayed

  Scenario: Select active market
    Given I am on the markets page
    When I click on "Active" market
    Then trading page for "active" market is displayed

  Scenario: Select suspended market
    Given I am on the markets page
    When I click on "Suspended" market
    Then trading page for "suspended" market is displayed

  Scenario: Accounts displayed when connected to wallet
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I click on accounts tab
    Then accounts are displayed
    And I can see account for tEURO

  Scenario: Positions displayed
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I click on positions tab
    Then positions are displayed

  Scenario: Placed orders displayed
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I click on orders tab
    Then placed orders are displayed
