import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from datetime import datetime, timedelta
from conftest import init_page, risk_accepted_setup, auth_setup
from fixtures.market import setup_continuous_market
from actions.utils import wait_for_toast_confirmation
from wallet_config import WalletConfig, MM_WALLET2

from actions.utils import (
    change_keys,
    create_and_faucet_wallet,
)

order_size = "order-size"
order_price = "order-price"
place_order = "place-order"
order_side_sell = "order-side-SIDE_SELL"
order_side_buy = "order-side-SIDE_BUY"
market_order = "order-type-Market"
limit_order = "order-type-Limit"
tif = "order-tif"
expire = "expire"



@pytest.fixture(scope="module")
def page(shared_vega, browser, request, continuous_market):
    with init_page(shared_vega, browser, request) as page:
        risk_accepted_setup(page)
        auth_setup(shared_vega, page)
        basic_key = WalletConfig("basic_key", "basic_key")
        create_and_faucet_wallet(vega=shared_vega, wallet=basic_key)
        page.goto(f"/#/markets/{continuous_market}")
        change_keys(page, shared_vega, "basic_key")
        yield page


@pytest.fixture(scope="module")
def continuous_market(shared_vega:VegaServiceNull):
    keypairs = shared_vega.wallet.get_keypairs("MarketSim")
    proposal_key = keypairs.get('market_maker')
    termination_key=keypairs.get('FJMKnwfZdd48C8NqvYrG')
    mm_2_key=keypairs.get('market_maker_2')

    kwargs = {}
    if proposal_key is not None:
        kwargs['proposal_key'] = proposal_key
    if termination_key is not None:
        kwargs['termination_key'] = termination_key
    if mm_2_key is not None:
        kwargs['mm_2_key'] = mm_2_key

    return setup_continuous_market(shared_vega, **kwargs)



def test_limit_buy_order_GTT( shared_vega: VegaServiceNull, page: Page):
    page.get_by_test_id(limit_order).click()
    page.get_by_test_id(order_side_buy).click()
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
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    page.get_by_test_id("All").click()
    page.reload()
    # 7002-SORD-017
    expect(page.get_by_role("row").nth(4)).to_contain_text("10+10LimitFilled120.00GTT:")


def test_limit_buy_order(shared_vega: VegaServiceNull, page: Page):
    page.get_by_test_id(limit_order).click()
    page.get_by_test_id(order_side_buy).click()
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(order_price).fill("120")
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    shared_vega.wait_fn(2)
    shared_vega.wait_for_total_catchup()
    page.get_by_test_id("All").click()
    page.reload()
    # 7002-SORD-017
    expect(page.get_by_role("row").nth(5)).to_contain_text("10+10LimitFilled120.00GTT")


def test_limit_sell_order(shared_vega: VegaServiceNull, page: Page):
    page.get_by_test_id(limit_order).click()
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
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    page.get_by_test_id("All").click()
    page.reload()
    expect(page.get_by_role("row").nth(6)).to_contain_text("10-10LimitFilled100.00GFN")



def test_market_sell_order(shared_vega: VegaServiceNull, page: Page):
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
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()

    page.get_by_test_id("All").click()
    page.reload()
    expect(page.get_by_role("row").nth(7)).to_contain_text("10-10MarketFilled-IOC")


def test_market_buy_order(shared_vega: VegaServiceNull, page: Page):
    page.get_by_test_id(market_order).click()
    page.get_by_test_id(order_side_buy).click()
    page.get_by_test_id(order_size).fill("10")
    page.get_by_test_id(tif).select_option("Fill or Kill (FOK)")
    page.get_by_test_id(place_order).click()
    wait_for_toast_confirmation(page)
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    page.get_by_test_id("All").click()
    page.reload()
    # 7002-SORD-010
    # 0003-WTXN-012
    # 0003-WTXN-003
    expect(page.get_by_role("row").nth(8)).to_contain_text("10+10MarketFilled-FOK")


def test_sidebar_should_be_open_after_reload(page: Page):
    expect(page.get_by_test_id("deal-ticket-form")).to_be_visible()
    page.get_by_test_id("Order").click()
    expect(page.get_by_test_id("deal-ticket-form")).not_to_be_visible()
    page.reload()
    expect(page.get_by_test_id("deal-ticket-form")).to_be_visible()

@pytest.mark.skip("We currently can't approve wallet connection through Sim")
@pytest.mark.usefixtures("risk_accepted")
def test_connect_vega_wallet(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id("order-price").fill("101")
    page.get_by_test_id("order-connect-wallet").click()
    expect(page.locator('[role="dialog"]')).to_be_visible()
    page.get_by_test_id("connector-jsonRpc").click()
    expect(page.get_by_test_id("wallet-dialog-title")).to_be_visible()
    # TODO: accept wallet connection and assert wallet is connected.
    expect(page.get_by_test_id("order-type-Limit")).to_be_checked()
    expect(page.get_by_test_id("order-price")).to_have_value("101")
