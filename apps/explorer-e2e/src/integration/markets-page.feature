@todo - Needs markets in capsule state
Feature: Markets Page

  Scenario: Navigate to markets page
    Given I am on the homepage
    When I navigate to the markets page
    Then markets page is correctly displayed

  Scenario: Navigate to markets page using mobile
    Given I am on mobile and open the toggle menu
    When I navigate to the markets page
    Then markets page is correctly displayed
