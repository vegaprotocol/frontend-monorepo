Feature: Home page

  Background:
    Given I am on the homepage

  Scenario: Visit Portfolio page
    And I navigate to portfolio page

  Scenario: Visit Markets page
    And I navigate to markets page

  Scenario: Able to switch public key for connected Vega wallet
    Given I connect to Vega Wallet
    When I open wallet dialog
    And select a different public key
    Then public key is switched

  Scenario: Unable to connect Vega wallet with incorrect credentials
    When I try to connect Vega wallet with incorrect details
    Then wallet not running error message is displayed

  Scenario: Unable to connect Vega wallet with blank fields
    When I try to connect Vega wallet with blank fields
    Then wallet field validation errors are shown
