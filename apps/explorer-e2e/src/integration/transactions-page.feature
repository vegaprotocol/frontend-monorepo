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
