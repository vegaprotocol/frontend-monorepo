Feature: Markets page

  Scenario: Navigation
    Given I am on the homepage
    When I navigate to markets page
    Then I can view markets
    And the market table is displayed

  Scenario: Select active market
    Given I am on the markets page
    When I click on an active market
    Then I am on the trading page for an active market

  Scenario: Select suspended market
    Given I am on the markets page
    When I click on a suspended market
    Then I am on the trading page for a suspended market
