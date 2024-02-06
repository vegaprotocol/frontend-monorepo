import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from datetime import datetime, timedelta
from actions.utils import (
    wait_for_toast_confirmation,
    change_keys,
    create_and_faucet_wallet,
)
from wallet_config import WalletConfig

order_size = "order-size"
order_price = "order-price"
place_order = "place-order"
order_side_sell = "order-side-SIDE_SELL"
market_order = "order-type-Market"
tif = "order-tif"
expire = "expire"


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_limit_buy_order_GTT(
    shared_vega: VegaServiceNull, shared_page: Page, shared_continuous_market, shared_auth, shared_risk_accepted
):
    limit_buy_order_GTT_wallet = WalletConfig(
        "limit_buy_order_GTT", "limit_buy_order_GTT"
    )
    create_and_faucet_wallet(vega=shared_vega, wallet=limit_buy_order_GTT_wallet)
    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(shared_page, shared_vega, limit_buy_order_GTT_wallet.name)
    shared_page.get_by_test_id(tif).select_option("Good 'til Time (GTT)")
    shared_page.get_by_test_id(order_size).fill("10")
    shared_page.get_by_test_id(order_price).fill("120")
    expires_at = datetime.now() + timedelta(days=1)
    expires_at_input_value = expires_at.strftime("%Y-%m-%dT%H:%M:%S")
    shared_page.get_by_test_id("date-picker-field").clear()
    shared_page.get_by_test_id("date-picker-field").fill(expires_at_input_value)
    # 7002-SORD-011
    expect(shared_page.get_by_test_id("place-order").locator("span").first).to_have_text(
        "Place limit order"
    )
    expect(shared_page.get_by_test_id("place-order").locator("span").last).to_have_text(
        "10 BTC @ 120.00 BTC"
    )
    shared_page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(2)
    shared_vega.wait_for_total_catchup()
    shared_page.get_by_test_id("All").click()
    # 7002-SORD-017
    expect(shared_page.get_by_role("row").nth(4)).to_contain_text("10+10LimitFilled120.00GTT:")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_limit_buy_order(shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_auth, shared_risk_accepted):
    limit_buy_order_wallet = WalletConfig("limit_buy_order", "limit_buy_order")
    create_and_faucet_wallet(vega=shared_vega, wallet=limit_buy_order_wallet)
    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(shared_page, shared_vega, limit_buy_order_wallet.name)
    shared_page.get_by_test_id(order_size).fill("10")
    shared_page.get_by_test_id(order_price).fill("120")
    shared_page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(2)
    shared_vega.wait_for_total_catchup()
    shared_page.get_by_test_id("All").click()
    # 7002-SORD-017
    expect(shared_page.get_by_role("row").nth(4)).to_contain_text("10+10LimitFilled120.00GTC")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_limit_sell_order(shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_risk_accepted, shared_auth):
    limit_sell_order = WalletConfig("limit_sell_order", "limit_sell_order")
    create_and_faucet_wallet(vega=shared_vega, wallet=limit_sell_order)
    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(shared_page, shared_vega, limit_sell_order.name)
    shared_page.get_by_test_id(order_size).fill("10")
    shared_page.get_by_test_id(order_price).fill("100")
    shared_page.get_by_test_id(order_side_sell).click()
    shared_page.get_by_test_id(tif).select_option("Good for Normal (GFN)")
    # 7002-SORD-011
    expect(shared_page.get_by_test_id("place-order").locator("span").first).to_have_text(
        "Place limit order"
    )
    expect(shared_page.get_by_test_id("place-order").locator("span").last).to_have_text(
        "10 BTC @ 100.00 BTC"
    )
    shared_page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(2)
    shared_vega.wait_for_total_catchup()
    shared_page.get_by_test_id("All").click()
    expect(shared_page.get_by_role("row").nth(4)).to_contain_text("10-10LimitFilled100.00GFN")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_market_sell_order(shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_auth, shared_risk_accepted):
    market_sell_order = WalletConfig("market_sell_order", "market_sell_order")
    create_and_faucet_wallet(vega=shared_vega, wallet=market_sell_order)
    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(shared_page, shared_vega, market_sell_order.name)

    shared_page.get_by_test_id(market_order).click()
    shared_page.get_by_test_id(order_size).fill("10")
    shared_page.get_by_test_id(order_side_sell).click()
    # 7002-SORD-011
    expect(shared_page.get_by_test_id("place-order").locator("span").first).to_have_text(
        "Place market order"
    )
    expect(shared_page.get_by_test_id("place-order").locator("span").last).to_have_text(
        "10 BTC @ market"
    )
    shared_page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(2)
    shared_vega.wait_for_total_catchup()

    shared_page.get_by_test_id("All").click()
    expect(shared_page.get_by_role("row").nth(4)).to_contain_text("10-10MarketFilled-IOC")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_market_buy_order(shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_auth, shared_risk_accepted):
    market_buy_order = WalletConfig("market_buy_order", "market_buy_order")
    create_and_faucet_wallet(vega=shared_vega, wallet=market_buy_order)
    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(shared_page, shared_vega, market_buy_order.name)

    shared_page.get_by_test_id(market_order).click()
    shared_page.get_by_test_id(order_size).fill("10")
    shared_page.get_by_test_id(tif).select_option("Fill or Kill (FOK)")
    shared_page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(2)
    shared_vega.wait_for_total_catchup()
    shared_page.get_by_test_id("All").click()
    # 7002-SORD-010
    # 0003-WTXN-012
    # 0003-WTXN-003
    expect(shared_page.get_by_role("row").nth(4)).to_contain_text("10+10MarketFilled-FOK")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_sidebar_should_be_open_after_reload(shared_continuous_market, shared_page: Page, shared_risk_accepted):
    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    expect(shared_page.get_by_test_id("deal-ticket-form")).to_be_visible()
    shared_page.get_by_test_id("Order").click()
    expect(shared_page.get_by_test_id("deal-ticket-form")).not_to_be_visible()
    shared_page.reload()
    expect(shared_page.get_by_test_id("deal-ticket-form")).to_be_visible()
