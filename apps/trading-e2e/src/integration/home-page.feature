Feature: Home page

  Scenario: Visit Home page
    Given I am on the homepage

  Scenario: Visit Portfolio page
    Given I am on the homepage
    And I navigate to portfolio page

  Scenario: Unable to connect Vega wallet with incorrect credentials
    Given I am on the homepage
    When I try to connect Vega wallet with incorrect details
    Then wallet not running error message is displayed

  Scenario: Unable to connect Vega wallet with blank fields
    Given I am on the homepage
    When I try to connect Vega wallet with blank fields
    Then wallet field validation errors are shown
