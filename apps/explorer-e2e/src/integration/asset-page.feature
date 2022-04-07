Feature: Asset Page

  Scenario: Navigate to Asset Page
    Given I am on the homepage
    When I navigate to the asset page
    Then asset page is correctly displayed

  Scenario: Navigate to Asset Page using mobile
    Given I am on mobile and open the toggle menu
    When I navigate to the asset page
    Then asset page is correctly displayed
