Feature: Validators Page

  Scenario: Navigate to validators page
    Given I am on the homepage
    When I navigate to the validators page
    Then validators page is correctly displayed

  Scenario: Navigate to validators page using mobile
    Given I am on mobile and open the toggle menu
    When I navigate to the validators page
    Then validators page is correctly displayed
