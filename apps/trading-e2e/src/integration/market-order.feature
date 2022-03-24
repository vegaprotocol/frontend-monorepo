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
      # | GFA            |
      | GFN            |

  Scenario Outline: Successfull market sell order
    Given I am on the homepage
    And I connect to Vega Wallet
    And I navigate to markets page
    When I click on active market
    And place a sell '<marketOrderType>' market order
    # Then order is successfull

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
      # | GFA            |
      | GFN            |


  Scenario: Unsuccessfull order because lack of funds
    Given I am on the homepage
    And I connect to Vega Wallet
    # In the future change step to connect wallet with no funds
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
    And market suspended error is shown

  @manual
  Scenario: Unsuccessfull buy/sell because wallet is not connected
    Given I am on the homepage
    And I disconnect from Vega Wallet
    And I navigate to markets page
    When I click on market for "BTCUSD"
    And place a buy 'IOC' limit order

  @manual
  Scenario: Unsuccessfull because non number entered in field
    Given I am on the homepage
    And I connect to Vega Wallet
    And I navigate to markets page
    When I click on market for "BTCUSD"
    And I place a buy FOK limit order with non number in the size field
    Then errror for invalid number is shown

  @manual
  Scenario: Unsuccessfull because quantity is 0/-1

  @manual
  Scenario: GTT order failed because invalid date

  @manual
  Scenario: GTT order failed because date in the past

  @manual
  Scenario: GTT order failed because date over allowed period
