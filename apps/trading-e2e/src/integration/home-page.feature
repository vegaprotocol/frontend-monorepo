Feature: Home page

  Scenario: Visit Home page
    Given I am on the homepage

  Scenario: Visit Portfolio page
    Given I am on the homepage
    And I navigate to portfolio page

  Scenario: Visit Markets page
    Given I am on the homepage
    And I navigate to markets page

  Scenario: Able to switch public key for connected Vega wallet
    Given I connect to Vega Wallet
    When I open wallet dialog
    And select a different public key
    Then public key is switched

  Scenario: Unable to connect Vega wallet with incorrect credentials
    Given I am on the homepage
    When I try to connect Vega wallet with incorrect details
    Then wallet not running error message is displayed

  Scenario: Unable to connect Vega wallet with blank fields
    Given I am on the homepage
    When I try to connect Vega wallet with blank fields
    Then wallet field validation errors are shown
