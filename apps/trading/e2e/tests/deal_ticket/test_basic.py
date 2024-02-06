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
@pytest.mark.parametrize("vega", ["shared"], indirect=True)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_limit_buy_order_GTT(
    shared_continuous_market, vega: VegaServiceNull, page: Page
):
    limit_buy_order_GTT_wallet = WalletConfig(
        "limit_buy_order_GTT", "limit_buy_order_GTT"
    )
    create_and_faucet_wallet(vega=vega, wallet=limit_buy_order_GTT_wallet)
    page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(page, vega, limit_buy_order_GTT_wallet.name)
    page.get_by_test_id(tif).select_option("Good 'til Time (GTT)")
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_price).fill("120")
    expires_at = datetime.now() + timedelta(days=1)
    expires_at_input_value = expires_at.strftime("%Y-%m-%dT%H:%M:%S")
    page.get_by_test_id("date-picker-field").clear()
    page.get_by_test_id("date-picker-field").fill(expires_at_input_value)
    # 7002-SORD-011
    expect(page.get_by_test_id("place-order").locator("span").first).to_have_text(
        "Place limit order"
    )
    expect(page.get_by_test_id("place-order").locator("span").last).to_have_text(
        "10 BTC @ 120.00 BTC"
    )
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(2)
    vega.wait_for_total_catchup()
    page.get_by_test_id("All").click()
    # 7002-SORD-017
    expect(page.get_by_role("row").nth(4)).to_contain_text("10+10LimitFilled120.00GTT:")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
@pytest.mark.parametrize("vega", ["shared"], indirect=True)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_limit_buy_order(shared_continuous_market, vega: VegaServiceNull, page: Page):
    limit_buy_order_wallet = WalletConfig("limit_buy_order", "limit_buy_order")
    create_and_faucet_wallet(vega=vega, wallet=limit_buy_order_wallet)
    page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(page, vega, limit_buy_order_wallet.name)
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_price).fill("120")
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(2)
    vega.wait_for_total_catchup()
    page.get_by_test_id("All").click()
    # 7002-SORD-017
    expect(page.get_by_role("row").nth(4)).to_contain_text("10+10LimitFilled120.00GTC")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
@pytest.mark.parametrize("vega", ["shared"], indirect=True)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_limit_sell_order(shared_continuous_market, vega: VegaServiceNull, page: Page):
    limit_sell_order = WalletConfig("limit_sell_order", "limit_sell_order")
    create_and_faucet_wallet(vega=vega, wallet=limit_sell_order)
    page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(page, vega, limit_sell_order.name)
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_price).fill("100")
    page.get_by_test_id(order_side_sell).click()
    page.get_by_test_id(tif).select_option("Good for Normal (GFN)")
    # 7002-SORD-011
    expect(page.get_by_test_id("place-order").locator("span").first).to_have_text(
        "Place limit order"
    )
    expect(page.get_by_test_id("place-order").locator("span").last).to_have_text(
        "10 BTC @ 100.00 BTC"
    )
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(2)
    vega.wait_for_total_catchup()
    page.get_by_test_id("All").click()
    expect(page.get_by_role("row").nth(4)).to_contain_text("10-10LimitFilled100.00GFN")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
@pytest.mark.parametrize("vega", ["shared"], indirect=True)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_market_sell_order(shared_continuous_market, vega: VegaServiceNull, page: Page):
    market_sell_order = WalletConfig("market_sell_order", "market_sell_order")
    create_and_faucet_wallet(vega=vega, wallet=market_sell_order)
    page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(page, vega, market_sell_order.name)

    page.get_by_test_id(market_order).click()
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_side_sell).click()
    # 7002-SORD-011
    expect(page.get_by_test_id("place-order").locator("span").first).to_have_text(
        "Place market order"
    )
    expect(page.get_by_test_id("place-order").locator("span").last).to_have_text(
        "10 BTC @ market"
    )
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(2)
    vega.wait_for_total_catchup()

    page.get_by_test_id("All").click()
    expect(page.get_by_role("row").nth(4)).to_contain_text("10-10MarketFilled-IOC")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
@pytest.mark.parametrize("vega", ["shared"], indirect=True)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_market_buy_order(shared_continuous_market, vega: VegaServiceNull, page: Page):
    market_buy_order = WalletConfig("market_buy_order", "market_buy_order")
    create_and_faucet_wallet(vega=vega, wallet=market_buy_order)
    page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(page, vega, market_buy_order.name)

    page.get_by_test_id(market_order).click()
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(tif).select_option("Fill or Kill (FOK)")
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(2)
    vega.wait_for_total_catchup()
    page.get_by_test_id("All").click()
    # 7002-SORD-010
    # 0003-WTXN-012
    # 0003-WTXN-003
    expect(page.get_by_role("row").nth(4)).to_contain_text("10+10MarketFilled-FOK")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
@pytest.mark.parametrize("vega", ["shared"], indirect=True)
@pytest.mark.usefixtures("risk_accepted")
def test_sidebar_should_be_open_after_reload(shared_continuous_market, page: Page):
    page.goto(f"/#/markets/{shared_continuous_market}")
    expect(page.get_by_test_id("deal-ticket-form")).to_be_visible()
    page.get_by_test_id("Order").click()
    expect(page.get_by_test_id("deal-ticket-form")).not_to_be_visible()
    page.reload()
    expect(page.get_by_test_id("deal-ticket-form")).to_be_visible()
