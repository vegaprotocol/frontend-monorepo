import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from fixtures.market import setup_simple_market
from conftest import init_vega, cleanup_container
from actions.utils import wait_for_toast_confirmation, change_keys
from actions.ticket import select_mini
from wallet_config import MM_WALLET, MM_WALLET2

market_trading_mode = "market-trading-mode"
market_state = "market-state"
item_value = "item-value"

COL_ID_FEE = ".ag-center-cols-container [col-id='fee'] .ag-cell-value"

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance



@pytest.fixture(scope="module")
def simple_market(vega):
    return setup_simple_market(vega)


@pytest.fixture(scope="module")
def setup_market_monitoring_auction(vega: VegaServiceNull, simple_market):
    vega.submit_liquidity(
        key_name=MM_WALLET.name,
        market_id=simple_market,
        commitment_amount=100,
        fee=0.002,
        is_amendment=False,
    )

    vega.submit_order(
        market_id=simple_market,
        trading_key=MM_WALLET.name,
        side="SIDE_BUY",
        order_type="TYPE_LIMIT",
        price=1 - 0.0005,
        wait=False,
        time_in_force="TIME_IN_FORCE_GTC",
        volume=99,
    )
    vega.submit_order(
        market_id=simple_market,
        trading_key=MM_WALLET.name,
        side="SIDE_SELL",
        order_type="TYPE_LIMIT",
        price=1 + 0.0005,
        wait=False,
        time_in_force="TIME_IN_FORCE_GTC",
        volume=99,
    )

    # add orders to provide liquidity
    submit_order(vega, MM_WALLET.name, simple_market, "SIDE_BUY", 1, 1)
    submit_order(vega, MM_WALLET.name, simple_market, "SIDE_SELL", 1, 1)
    submit_order(
        vega,
        MM_WALLET.name,
        simple_market,
        "SIDE_BUY",
        1,
        1 + 0.1 / 2,
    )
    submit_order(vega, MM_WALLET.name, simple_market, "SIDE_SELL", 1, 1 + 0.1 / 2)
    submit_order(vega, MM_WALLET2.name, simple_market, "SIDE_SELL", 1, 1)

    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    # add orders that change the price so that it goes beyond the limits of price monitoring
    submit_order(vega, MM_WALLET.name, simple_market, "SIDE_SELL", 100, 300)
    submit_order(vega, MM_WALLET2.name, simple_market, "SIDE_BUY", 100, 290)
    submit_order(vega, MM_WALLET.name, simple_market, "SIDE_SELL", 100, 305)
    submit_order(vega, MM_WALLET2.name, simple_market, "SIDE_BUY", 100, 295)
    submit_order(vega, MM_WALLET2.name, simple_market, "SIDE_BUY", 1, 305)

    vega.wait_fn(1)
    vega.wait_for_total_catchup()


@pytest.mark.usefixtures("risk_accepted", "auth", "setup_market_monitoring_auction")
def test_market_monitoring_auction_price_volatility_limit_order(
    page: Page, simple_market, vega: VegaServiceNull
):
    page.goto(f"/#/markets/{simple_market}")
    page.get_by_test_id("order-size").clear()
    page.get_by_test_id("order-size").type("1")
    page.get_by_test_id("order-price").clear()
    page.get_by_test_id("order-price").type("110")
    select_mini(page,"order-tif", "Fill or Kill (FOK)")
    page.get_by_test_id("place-order").click()
    expect(page.get_by_test_id("deal-ticket-error-message-tif")).to_have_text(
        "This market is in auction due to high price volatility. Until the auction ends, you can only place GFA, GTT, or GTC limit orders."
    )
    expect(page.get_by_test_id("deal-ticket-error-message-tif")).to_be_visible()

    expect(page.get_by_test_id("deal-ticket-warning-auction")).to_have_text(
        "Any orders placed now will not trade until the auction ends"
    )
    expect(page.get_by_test_id("deal-ticket-warning-auction")).to_be_visible()

    select_mini(page,"order-tif", "Good 'til Cancelled (GTC)")

    expect(page.get_by_test_id("deal-ticket-error-message-tif")).not_to_be_visible()

    page.get_by_test_id("place-order").click()

    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id("Open").click()
    expect(page.get_by_role("row").nth(4)).to_contain_text(
        "0+1LimitActive110.00GTC"
    )


@pytest.mark.usefixtures("risk_accepted", "auth", "setup_market_monitoring_auction")
def test_market_monitoring_auction_price_volatility_market_order(
    page: Page, simple_market
):
    page.goto(f"/#/markets/{simple_market}")
    page.get_by_test_id("order-type-Market").click()
    page.get_by_test_id("order-size").clear()
    page.get_by_test_id("order-size").type("1")
    # 7002-SORD-060
    page.get_by_test_id("place-order").click()
    expect(page.get_by_test_id("deal-ticket-error-message-tif")).to_have_text(
        "This market is in auction due to high price volatility. Until the auction ends, you can only place GFA, GTT, or GTC limit orders."
    )
    expect(page.get_by_test_id("deal-ticket-error-message-tif")).to_be_visible()

    expect(page.get_by_test_id("deal-ticket-error-message-type")).to_have_text(
        "This market is in auction due to high price volatility. Only limit orders are permitted when market is in auction."
    )
    expect(page.get_by_test_id("deal-ticket-error-message-type")).to_be_visible()

@pytest.mark.usefixtures("risk_accepted", "auth", "setup_market_monitoring_auction")
def test_market_price_volatility(
    page: Page, simple_market, vega: VegaServiceNull
):
    page.goto(f"/#/markets/{simple_market}")
    expect(
        page.get_by_test_id(market_trading_mode).get_by_test_id(item_value)
    ).to_have_text("Monitoring auction - price")
    expect(page.get_by_test_id(market_state).get_by_test_id(item_value)).to_have_text(
        "Suspended"
    )

@pytest.mark.usefixtures("risk_accepted", "auth", "setup_market_monitoring_auction")
def test_auction_uncross_fees(simple_market, vega: VegaServiceNull, page: Page):
    page.goto(f"/#/markets/{simple_market}")
    change_keys(page, vega, "market_maker")
    page.get_by_test_id("Trades").nth(1).click()
    row = page.locator('[row-index="3"]').nth(1)
    expect(row.locator('[col-id="fee"]')).to_have_text("0.00 tDAI")
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    row.locator('[col-id="fee"]').hover()
    expect(page.get_by_test_id("fee-breakdown-tooltip")).to_have_text(
        "If the market was suspendedDuring auction, half the infrastructure and liquidity fees will be paid.Infrastructure fee0.00 tDAILiquidity fee0.00 tDAIMaker fee0.00 tDAITotal fees0.00 tDAI"
    )
