Feature: Market orders

  Scenario Outline: Successfull market buy orders
    Given I am on the homepage
    And I connect to Vega Wallet
    And I navigate to markets page
    When I click on active market
    And place a buy '<marketOrderType>' market order
    Then order request is sent

    Examples:
      | marketOrderType |
      | FOK             |
      | IOC             |

  Scenario Outline: Successfull Limit buy orders
    Given I am on the homepage
    And I connect to Vega Wallet
    And I navigate to markets page
    When I click on active market
    And place a buy '<limitOrderType>' limit order
    Then order request is sent

    Examples:
      | limitOrderType |
      | IOC            |
      | FOK            |
      | GTT            |
      # | GFA            | Requires market to be in auction
      | GFN            |

  Scenario Outline: Successfull market sell order
    Given I am on the homepage
    And I connect to Vega Wallet
    And I navigate to markets page
    When I click on active market
    And place a sell '<marketOrderType>' market order
    Then order request is sent

    Examples:
      | marketOrderType |
      | FOK             |
      | IOC             |

  Scenario Outline: Successfull limit sell order
    Given I am on the homepage
    And I connect to Vega Wallet
    And I navigate to markets page
    When I click on active market
    And place a sell '<limitOrderType>' limit order

    Examples:
      | limitOrderType |
      | IOC            |
      | FOK            |
      | GTT            |
      # | GFA            | Requires market to be in auction
      | GFN            |

  Scenario: Unsuccessfull order because lack of funds
    Given I am on the homepage
    And I connect to Vega Wallet
    And I navigate to markets page
    When I click on active market
    And place a buy 'FOK' market order
    Then error message for insufficient funds is displayed

  Scenario: Unable to order because market is suspended
    Given I am on the homepage
    And I connect to Vega Wallet
    And I navigate to markets page
    When I click on suspended market
    Then place order button is disabled
    And "Market is currently suspended" error is shown

  Scenario: Unable to order because wallet is not connected
    Given I am on the homepage
    And I navigate to markets page
    When I click on active market
    Then place order button is disabled
    And "No public key selected" error is shown

  Scenario: Unsuccessfull because quantity is 0
    Given I am on the homepage
    And I connect to Vega Wallet
    And I navigate to markets page
    When I click on active market
    And place a buy 'FOK' market order with amount of 0
    Then Order rejected by wallet error shown containing text "must be positive"

  @manual
  Scenario: GTT order failed because invalid date

  @manual
  Scenario: GTT order failed because date in the past

  @manual
  Scenario: GTT order failed because date over allowed period
