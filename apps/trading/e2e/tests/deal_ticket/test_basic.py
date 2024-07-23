import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from datetime import datetime, timedelta
from conftest import init_vega, cleanup_container
from fixtures.market import setup_continuous_market
from actions.vega import submit_order
from actions.utils import wait_for_toast_confirmation, change_keys
from actions.ticket import select_mini
from wallet_config import PARTY_C, MM_WALLET

order_size = "order-size"
order_price = "order-price"
place_order = "place-order"
order_side_sell = "order-side-SIDE_SELL"
market_order = "order-type-market"
tif = "order-tif"

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance


@pytest.fixture(scope="module")
def continuous_market(vega):
    return setup_continuous_market(vega)

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_limit_buy_order_GTT(continuous_market, vega: VegaServiceNull, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    select_mini(page, tif, "Good 'til Time (GTT)")
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_price).fill("120")
    expires_at = datetime.now() + timedelta(days=1)
    expires_at_input_value = expires_at.strftime("%Y-%m-%dT%H:%M:%S")
    page.get_by_test_id("date-picker-field").clear()
    page.get_by_test_id("date-picker-field").fill(expires_at_input_value)
    # 7002-SORD-011
    expect(page.get_by_test_id(place_order).locator("span").first).to_have_text(
        "Place limit order"
    )
    expect(page.get_by_test_id(place_order).locator("span").last).to_have_text(
        "10 BTC @ 120 BTC"
    )
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id("Order history").click()
    # 7002-SORD-017
    container = page.locator('.ag-center-cols-container')
    expect(container.get_by_role("row").nth(0)).to_contain_text("10+10LimitFilled120.00GTT:")


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_limit_buy_order(continuous_market, vega: VegaServiceNull, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_price).fill("120")
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(2)
    vega.wait_for_total_catchup()
    page.get_by_test_id("Order history").click()
    # 7002-SORD-017
    container = page.locator('.ag-center-cols-container')
    expect(container.get_by_role("row").nth(0)).to_contain_text("10+10LimitFilled120.00GTC")


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_limit_sell_order(continuous_market, vega: VegaServiceNull, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_price).fill("100")
    page.get_by_test_id(order_side_sell).click()
    select_mini(page, tif, "Good for Normal (GFN)")
    # 7002-SORD-011
    expect(page.get_by_test_id(place_order).locator("span").first).to_have_text(
        "Place limit order"
    )
    expect(page.get_by_test_id(place_order).locator("span").last).to_have_text(
        "10 BTC @ 100 BTC"
    )
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id("Order history").click()
    container = page.locator('.ag-center-cols-container')
    expect(container.get_by_role("row").nth(0)).to_contain_text("10-10LimitFilled100.00GFN")


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_market_sell_order(continuous_market, vega: VegaServiceNull, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(market_order).click()
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_side_sell).click()
    # 7002-SORD-011
    expect(page.get_by_test_id(place_order).locator("span").first).to_have_text(
        "Place market order"
    )
    expect(page.get_by_test_id(place_order).locator("span").last).to_have_text(
        "10 BTC @ market"
    )
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    page.get_by_test_id("Order history").click()
    container = page.locator('.ag-center-cols-container')
    expect(container.get_by_role("row").nth(0)).to_contain_text("10-10MarketFilled-IOC")


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_market_buy_order(continuous_market, vega: VegaServiceNull, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(market_order).click()
    page.get_by_test_id(order_size).fill("10")
    select_mini(page, tif, "Fill or Kill (FOK)")
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id("Order history").click()
    # 7002-SORD-010
    # 0003-WTXN-012
    # 0003-WTXN-003
    container = page.locator('.ag-center-cols-container')
    expect(container.get_by_role("row").nth(0)).to_contain_text("10+10MarketFilled-FOK")

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_liquidated_tooltip(continuous_market, vega: VegaServiceNull, page: Page):
    tdai_id = vega.find_asset_id(symbol="tDAI")
    vega.mint(
        PARTY_C.name,
        asset=tdai_id,
        amount=20,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    submit_order(vega, PARTY_C.name, continuous_market, "SIDE_BUY", 1, 110)
    submit_order(vega, "Key 1", continuous_market, "SIDE_SELL", 1, 110)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.goto(f"/#/markets/{continuous_market}")
    change_keys(page, vega, PARTY_C.name)
    submit_order(vega, MM_WALLET.name, continuous_market, "SIDE_BUY", 100, 90)
    submit_order(vega, "Key 1", continuous_market, "SIDE_SELL", 100, 90)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    page.locator("label").filter(has_text="Show closed positions").click()
    # TODO: below is flakey due to row 9 being used
    # page.locator('[id="cell-openVolume-9"]').hover()
    # expect(page.get_by_test_id("tooltip-content").first).to_contain_text("")
