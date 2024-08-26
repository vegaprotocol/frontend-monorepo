import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from datetime import datetime, timedelta
from actions.utils import wait_for_toast_confirmation
from actions.ticket import select_mini

stop_order_btn = "order-type-stop"
stop_limit_order_btn = "order-type-stopLimit"
stop_market_order_btn = "order-type-stopMarket"
order_side_sell = "order-side-SIDE_SELL"
trigger_above = "triggerDirection-risesAbove"
trigger_below = "triggerDirection-fallsBelow"
trigger_price = "order-triggerPrice"
trigger_type_price = "triggerType-price"
trigger_type_trailing_percent_offset = "triggerType-trailingPercentOffset"
order_size = "order-size"
order_price = "order-price"
order_tif = "order-tif"
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

    expect(page.get_by_test_id("error-triggerPrice")).to_have_text(
        "Required"
    )
    expect(page.get_by_test_id("error-price")).to_have_text(
        "Required"
    )

    page.get_by_test_id(order_size).fill("1")
    page.get_by_test_id(order_price).fill("0.0000001")
    expect(page.get_by_test_id("error-price")).to_have_text(
        "Number must be greater than or equal to 0.00001"
    )

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_submit_stop_order_rejected(
    continuous_market, vega: VegaServiceNull, page: Page
):
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
    container = page.locator('.ag-center-cols-container')
    expect(container.get_by_role("row").nth(0)).to_contain_text(
        "Mark > 103.00+3MarketRejected-FOK"
    )

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
    select_mini(page, 'order-stopExpiryStrategy', 'Cancel')
    expires_at = datetime.now() + timedelta(days=1)
    expires_at_input_value = expires_at.strftime("%Y-%m-%dT%H:%M:%S")
    # Sometimes playright does not find the field to be visible, enabled and editable
    page.get_by_test_id("date-picker-field").fill(expires_at_input_value, force=True)
    page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    container = page.locator('.ag-center-cols-container')
    expect(container.get_by_role("row").nth(0)).to_contain_text("Mark > 103.00")
    expect(container.get_by_role("row").nth(0)).to_contain_text("-1MarketTriggered-FOK")


@pytest.mark.skip("flakey")
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
    select_mini(page, 'trigger-direction', 'Falls below')
    page.get_by_test_id(trigger_price).fill("102")
    page.get_by_test_id(order_price).fill("99")
    page.get_by_test_id(order_size).fill("1")
    select_mini(page, order_tif,  "Immediate or Cancel (IOC)")
    select_mini(page, 'order-stopExpiryStrategy', 'Trigger')
    expires_at = datetime.now() + timedelta(days=1)
    expires_at_input_value = expires_at.strftime("%Y-%m-%dT%H:%M:%S")
    # Sometimes playright does not find the field to be visible, enabled and editable
    page.get_by_test_id("date-picker-field").fill(expires_at_input_value, force=True)
    page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    container = page.locator('.ag-center-cols-container')
    expect(container.get_by_role("row").nth(0)).to_contain_text("Mark < 102.00Submit")
    expect(container.get_by_role("row").nth(0)).to_contain_text("-1LimitPending99.00IOC")

@pytest.mark.skip("TODO: fix as preview 77 breaks")
@pytest.mark.usefixtures("auth", "risk_accepted")
@pytest.mark.skip(reason="TODO: fix this flaky test")
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
    select_mini(page, 'trigger-direction', 'Falls below')
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
    page.pause()
    page.get_by_test_id(close_toast).first.click()

    container = page.locator('.ag-center-cols-container')
    expect(container.get_by_role("row").nth(0)).to_contain_text("Cancelled")
