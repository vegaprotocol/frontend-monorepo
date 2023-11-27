import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from actions.vega import submit_order
from wallet_config import MM_WALLET, MM_WALLET2
import logging

logger = logging.getLogger()

table_row_selector = (
    '[data-testid="tab-open-markets"] .ag-center-cols-container .ag-row'
)
trading_mode_col = '[col-id="tradingMode"]'
state_col = '[col-id="state"]'
item_value = "item-value"
price_monitoring_bounds_row = "key-value-table-row"
market_trading_mode = "market-trading-mode"
market_state = "market-state"
liquidity_supplied = "liquidity-supplied"
item_value = "item-value"
price_monitoring_bounds_row = "key-value-table-row"
market_trading_mode = "market-trading-mode"
market_state = "market-state"
liquidity_supplied = "liquidity-supplied"

initial_commitment: float = 100
initial_price: float = 1
initial_volume: float = 1
initial_spread: float = 0.1
market_name = "BTC:DAI_2023"


@pytest.mark.usefixtures("vega", "page", "simple_market", "risk_accepted")
def test_price_monitoring(simple_market, vega: VegaService, page: Page):
    page.goto(f"/#/markets/all")
    expect(page.locator(table_row_selector).locator(trading_mode_col)).to_have_text(
        "Opening auction"
    )
    expect(page.locator(table_row_selector).locator('[col-id="state"]')).to_have_text(
        "Pending"
    )
    result = page.get_by_text(market_name)
    result.first.click()
    page.get_by_test_id(market_trading_mode).get_by_text("Opening auction").hover()
    expect(page.get_by_test_id("opening-auction-sub-status").first).to_have_text(
        "Opening auction: Not enough liquidity to open"
    )
    logger.info(page.get_by_test_id("opening-auction-sub-status").inner_text)
    vega.submit_liquidity(
        key_name=MM_WALLET.name,
        market_id=simple_market,
        commitment_amount=initial_commitment,
        fee=0.002,
        is_amendment=False,
    )

    vega.submit_order(
        market_id=simple_market,
        trading_key=MM_WALLET.name,
        side="SIDE_BUY",
        order_type="TYPE_LIMIT",
        price=initial_price - 0.0005,
        wait=False,
        time_in_force="TIME_IN_FORCE_GTC",
        volume=99,
    )
    vega.submit_order(
        market_id=simple_market,
        trading_key=MM_WALLET.name,
        side="SIDE_SELL",
        order_type="TYPE_LIMIT",
        price=initial_price + 0.0005,
        wait=False,
        time_in_force="TIME_IN_FORCE_GTC",
        volume=99,
    )
    #6002-MDET-009
    expect(
        page.get_by_test_id(liquidity_supplied).get_by_test_id(item_value)
    ).to_have_text("0.00 (0.00%)")

    # add orders to provide liquidity
    submit_order(
        vega, MM_WALLET.name, simple_market, "SIDE_BUY", initial_volume, initial_price
    )
    submit_order(
        vega, MM_WALLET.name, simple_market, "SIDE_SELL", initial_volume, initial_price
    )
    submit_order(
        vega,
        MM_WALLET.name,
        simple_market,
        "SIDE_BUY",
        initial_volume,
        initial_price + initial_spread / 2,
    )
    submit_order(
        vega,
        MM_WALLET.name,
        simple_market,
        "SIDE_SELL",
        initial_volume,
        initial_price + initial_spread / 2,
    )
    submit_order(
        vega, MM_WALLET2.name, simple_market, "SIDE_SELL", initial_volume, initial_price
    )
    expect(
        page.get_by_test_id(liquidity_supplied).get_by_test_id(item_value)
    ).to_have_text("100.00 (>100%)")

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(
        page.get_by_test_id(liquidity_supplied).get_by_test_id(item_value)
    ).to_have_text("50.00 (>100%)")

    page.goto(f"/#/markets/all")
    # temporary skip
    # expect(page.locator(table_row_selector).locator(trading_mode_col)).to_have_text(
    #     "Continuous"
    # )

    # commented out because we have an issue #4233
    # expect(page.locator(row_selector).locator(state_col)
    #        ).to_have_text("Pending")

    page.goto(f"/#/markets/all")
    result = page.get_by_text(market_name)
    result.first.click()

    page.get_by_test_id("Info").click()
    page.get_by_test_id("accordion-title").get_by_text(
        "Price monitoring bounds 1"
    ).click()
    expect(
        page.get_by_test_id(price_monitoring_bounds_row).first.get_by_text(
            "1.32217 BTC"
        )
    ).to_be_visible()
    expect(
        page.get_by_test_id(price_monitoring_bounds_row).last.get_by_text("0.79245 BTC")
    ).to_be_visible()

    # add orders that change the price so that it goes beyond the limits of price monitoring
    submit_order(vega, MM_WALLET.name, simple_market, "SIDE_SELL", 100, 110)
    submit_order(vega, MM_WALLET2.name, simple_market, "SIDE_BUY", 100, 90)
    submit_order(vega, MM_WALLET.name, simple_market, "SIDE_SELL", 100, 105)
    submit_order(vega, MM_WALLET2.name, simple_market, "SIDE_BUY", 100, 95)

    # add order at the current price so that it is possible to change the status to price monitoring
    to_cancel = submit_order(vega, MM_WALLET2.name, simple_market, "SIDE_BUY", 1, 105)

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup() 
    expect(
        page.get_by_test_id(price_monitoring_bounds_row).first.get_by_text(
            "135.44204 BTC"
        )
    ).to_be_visible()
    expect(
        page.get_by_test_id(price_monitoring_bounds_row).last.get_by_text(
            "81.17758 BTC"
        )
    ).to_be_visible()
    expect(
        page.get_by_test_id(market_trading_mode).get_by_test_id(item_value)
    ).to_have_text("Monitoring auction - price")
    expect(page.get_by_test_id(market_state).get_by_test_id(item_value)).to_have_text(
        "Suspended"
    )
    expect(
        page.get_by_test_id(liquidity_supplied).get_by_test_id(item_value)
    ).to_have_text("50.00 (8.78%)")

    # cancel order to increase liquidity
    vega.cancel_order(MM_WALLET2.name, simple_market, to_cancel)

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    expect(page.get_by_text(market_name).first).to_be_attached()
    expect(
        page.get_by_test_id(market_trading_mode).get_by_test_id(item_value)
    ).to_have_text("Continuous")
    expect(page.get_by_test_id(market_state).get_by_test_id(item_value)).to_have_text(
        "Active"
    )
    # commented out because we have an issue #4233
    # expect(page.get_by_text("Opening auction")).to_be_hidden()
    
    #6002-MDET-009
    expect(
        page.get_by_test_id(liquidity_supplied).get_by_test_id(item_value)
    ).to_have_text("50.00 (>100%)")
