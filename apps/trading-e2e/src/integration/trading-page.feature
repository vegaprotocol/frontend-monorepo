Feature: Trading page
  Scenario Outline: Deal ticket: Successfull market buy orders
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I place a buy '<marketOrderType>' market order
    Then order request is sent

    Examples:
      | marketOrderType |
      | FOK             |
      | IOC             |

  Scenario Outline: Deal ticket: Successfull Limit buy orders
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I place a buy '<limitOrderType>' limit order
    Then order request is sent

    Examples:
      | limitOrderType |
      | IOC            |
      | FOK            |
      | GTT            |
      # | GFA            | Requires market to be in auction
      | GFN            |

  Scenario Outline: Deal ticket: Successfull market sell order
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I place a sell '<marketOrderType>' market order
    Then order request is sent

    Examples:
      | marketOrderType |
      | FOK             |
      | IOC             |

  Scenario Outline: Deal ticket: Successfull limit sell order
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I place a sell '<limitOrderType>' limit order
    Then order request is sent

    Examples:
      | limitOrderType |
      | IOC            |
      | FOK            |
      | GTT            |
      # | GFA            | Requires market to be in auction
      | GFN            |

  @ignore
  Scenario: Deal ticket: Unsuccessfull order because lack of funds
    Given I am on the homepage
    And I navigate to markets page
    When I click on active market
    And I connect to Vega Wallet
    And place a buy 'FOK' market order
    Then error message for insufficient funds is displayed

  Scenario: Deal ticket: Unable to order because market is suspended
    Given I am on the trading page for a suspended market
    And I connect to Vega Wallet
    Then place order button is disabled
    And "Market is currently suspended" error is shown

  Scenario: Deal ticket: Unable to order because wallet is not connected
    Given I am on the trading page for an active market
    Then place order button is disabled
    And "No public key selected" error is shown

  @ignore
  Scenario: Deal ticket: Unsuccessfull because quantity is 0
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    And place a buy 'FOK' market order with amount of 0
    Then Order rejected by wallet error shown containing text "must be positive"

  Scenario: Positions: Displayed when connected to wallet
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I click on positions tab
    Then positions are displayed

  Scenario: Accounts: Displayed when connected to wallet
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I click on accounts tab
    Then accounts are displayed
    And I can see account for tEURO

  Scenario: Orders: Placed orders displayed
    Given I am on the trading page for an active market
    And I connect to Vega Wallet
    When I click on orders tab
    Then placed orders are displayed

    Scenario: Orderbook displayed
    Given I am on the trading page for an active market
    When I click on order book tab
    Then orderbook is displayed with expected orders
    And orderbook can be reduced and expanded

    @todo
    Scenario: Orderbook paginated with over 100 orders
    Given I am on the trading page for an active market
    When I click on order book tab
    And a large amount is orders are received
    Then a certain amount of orders are displayed

    @todo
    Scenario: Orderbook uses non-static prices for market in auction
    Given I am on the trading page for a market in auction
    When I click on order book tab
    Then order book is rendered using non-static offers

    @todo
    Scenario: Orderbook updated when large order is made
    Given I am on the trading page for an active market
    When I place a large order
    Then I should see my order have an effect on the order book

    @todo
    Scenario: Able to place order by clicking on order from orderbook
    Given I am on the trading page for an active market
    When I place a large order
    Then I should see my order have an effect on the order book
