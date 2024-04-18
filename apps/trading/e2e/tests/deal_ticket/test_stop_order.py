import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from datetime import datetime, timedelta
from conftest import init_vega, cleanup_container
from fixtures.market import setup_continuous_market
from actions.utils import wait_for_toast_confirmation

stop_order_btn = "order-type-Stop"
stop_limit_order_btn = "order-type-StopLimit"
stop_market_order_btn = "order-type-StopMarket"
order_side_sell = "order-side-SIDE_SELL"
trigger_above = "triggerDirection-risesAbove"
trigger_below = "triggerDirection-fallsBelow"
trigger_price = "triggerPrice"
trigger_type_price = "triggerType-price"
trigger_type_trailing_percent_offset = "triggerType-trailingPercentOffset"
order_size = "order-size"
order_price = "order-price"
order_tif = "order-tif"
expire = "expire"
expiry_strategy = '[for="expiryStrategy"]'
expiry_strategy_submit = "expiryStrategy-submit"
expiry_strategy_cancel = "expiryStrategy-cancel"
date_picker_field = "date-picker-field"
submit_stop_order = "place-order"
stop_orders_tab = "Advanced orders"
row_table = "row"
cancel = "cancel"
market_name_col = '[data-testid="market-code"]'
trigger_col = '[col-id="trigger"]'
expiresAt_col = '[col-id="expiresAt"]'
size_col = '[col-id="submission.size"]'
submission_type = '[col-id="submission.type"]'
status_col = '[col-id="status"]'
price_col = '[col-id="submission.price"]'
timeInForce_col = '[col-id="submission.timeInForce"]'
updatedAt_col = '[col-id="updatedAt"]'
close_toast = "toast-close"

def create_position(vega: VegaServiceNull, market_id):
    submit_order(vega, "Key 1", market_id, "SIDE_SELL", 100, 110)
    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 100, 110)
    vega.wait_fn(1)
    vega.wait_for_total_catchup

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_stop_order_form_error_validation(continuous_market, page: Page):
    # 7002-SORD-032
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_limit_order_btn).is_visible()
    page.get_by_test_id(stop_limit_order_btn).click()
    page.get_by_test_id(order_side_sell).click()
    page.get_by_test_id(submit_stop_order).click()
    expect(page.get_by_test_id("stop-order-error-message-trigger-price")).to_have_text(
        "You need to provide a price"
    )
    expect(page.get_by_test_id("stop-order-error-message-size")).to_have_text(
        "Size cannot be lower than 1"
    )

    page.get_by_test_id(order_size).fill("1")
    page.get_by_test_id(order_price).fill("0.0000001")
    expect(page.get_by_test_id("stop-order-error-message-price")).to_have_text(
        "Price cannot be lower than 0.00001"
    )


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_submit_stop_order_rejected(continuous_market, vega: VegaServiceNull, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_orders_tab).click()
    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_market_order_btn).is_visible()
    page.get_by_test_id(stop_market_order_btn).click()
    page.get_by_test_id(trigger_price).fill("103")
    page.get_by_test_id(order_size).fill("3")
    page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(page.get_by_role("row").nth(4)).to_contain_text("Mark > 103.00+3MarketRejected-FOK")

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_submit_stop_market_order_triggered(
    continuous_market, vega: VegaServiceNull, page: Page
):
    # 7002-SORD-071
    # 7002-SORD-074
    # 7002-SORD-075
    # 7002-SORD-067
    # 7002-SORD-068
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_orders_tab).click()
    # create a position because stop order is reduce only type
    create_position(vega, continuous_market)

    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_market_order_btn).is_visible()
    page.get_by_test_id(stop_market_order_btn).click()
    page.get_by_test_id(order_side_sell).click()
    page.get_by_test_id(trigger_price).fill("103")
    page.get_by_test_id(order_size).fill("1")
    page.get_by_test_id(expire).click()
    expires_at = datetime.now() + timedelta(days=1)
    expires_at_input_value = expires_at.strftime("%Y-%m-%dT%H:%M:%S")
    page.get_by_test_id("date-picker-field").fill(expires_at_input_value)
    page.get_by_test_id(expiry_strategy_cancel).type(" ")
    page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(page.get_by_role("row").nth(4)).to_contain_text("Mark > 103.00Cancels")
    expect(page.get_by_role("row").nth(4)).to_contain_text("-1MarketTriggered-FOK")

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_submit_stop_limit_order_pending(
    continuous_market, vega: VegaServiceNull, page: Page
):
    # 7002-SORD-071
    # 7002-SORD-074
    # 7002-SORD-075
    # 7002-SORD-069
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_orders_tab).click()
    # create a position because stop order is reduce only type
    create_position(vega, continuous_market)

    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_limit_order_btn).is_visible()
    page.get_by_test_id(stop_limit_order_btn).click()
    page.get_by_test_id(order_side_sell).click()
    page.get_by_test_id(trigger_below).type(" ")
    page.get_by_test_id(trigger_price).fill("102")
    page.get_by_test_id(order_price).fill("99")
    page.get_by_test_id(order_size).fill("1")
    page.get_by_test_id("order-tif").select_option("TIME_IN_FORCE_IOC")
    page.get_by_test_id(expire).click()
    expires_at = datetime.now() + timedelta(days=1)
    expires_at_input_value = expires_at.strftime("%Y-%m-%dT%H:%M:%S")
    page.get_by_test_id("date-picker-field").fill(expires_at_input_value)
    page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(page.get_by_role("row").nth(4)).to_contain_text("Mark < 102.00Submit")
    expect(page.get_by_role("row").nth(4)).to_contain_text("-1LimitPending99.00IOC")

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_submit_stop_limit_order_cancel(
    continuous_market, vega: VegaServiceNull, page: Page
):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_orders_tab).click()
    # create a position because stop order is reduce only type
    create_position(vega, continuous_market)

    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_limit_order_btn).is_visible()
    page.get_by_test_id(stop_limit_order_btn).click()
    page.get_by_test_id(order_side_sell).click()
    page.get_by_test_id(trigger_below).type(" ")
    page.get_by_test_id(trigger_price).fill("102")
    page.get_by_test_id(order_price).fill("99")
    page.get_by_test_id(order_size).fill("1")
    page.get_by_test_id(submit_stop_order).click()
    
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id(close_toast).first.click()
    page.get_by_test_id(cancel).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id(close_toast).first.click()

    expect(page.get_by_role("row").nth(4)).to_contain_text("Cancelled")
