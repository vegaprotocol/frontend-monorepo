Feature: Network parameters Page

  Scenario: Navigate to network parameters page
    Given I am on the homepage
    When I navigate to network parameters page
    Then network parameters page is correctly displayed

  Scenario: Navigate to network parameters page using mobile
    Given I am on mobile and open the toggle menu
    When I navigate to network parameters page
    Then network parameters page is correctly displayed
