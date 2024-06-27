import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from actions.vega import submit_order
from actions.utils import wait_for_toast_confirmation

edit_tpsl = "edit-tpsl"
price_input = "price-input"
size_input = "size-input"
add_take_profit = "add-take-profit"
summary_message = "summary-message"
submit_btn = "submit"
add_stop_loss = "add-stop-loss"
stop_order_info = "stop-order"

def create_position(vega: VegaServiceNull, market_id):
    submit_order(vega, "Key 1", market_id, "SIDE_SELL", 100, 110)
    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 100, 110)
    vega.wait_fn(1)
    vega.wait_for_total_catchup

@pytest.mark.skip(reason="TODO: fix this flaky test")
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_add_tp_sl_to_position(continuous_market, page: Page, vega: VegaServiceNull):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(edit_tpsl).click()
    page.get_by_test_id(add_take_profit).click()
    page.get_by_test_id(price_input).click()
    page.get_by_test_id(price_input).fill("120")
    page.get_by_test_id(size_input).click()
    page.get_by_test_id(size_input).fill("30")
    expect(page.get_by_test_id(summary_message)).to_have_text("When the mark price rises above 120 BTC it will trigger an order to reduce 30% of remaining position for an estimated PNL of 3.75 BTC.")
    page.get_by_test_id(submit_btn).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(page.get_by_test_id(stop_order_info)).to_have_text("Reduce 30% at 120.00 BTC for estimated PnL of 3.75 BTC")
    page.get_by_test_id(add_stop_loss).click()
    page.get_by_test_id(price_input).click()
    page.get_by_test_id(price_input).fill("100")
    page.get_by_test_id(size_input).click()
    page.get_by_test_id(size_input).fill("30")
    expect(page.get_by_test_id(summary_message)).to_have_text("When the mark price falls below 100 BTC it will trigger an order to reduce 30% of remaining position for an estimated PNL of -2.25 BTC.")
    page.get_by_test_id(submit_btn).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(page.get_by_test_id(stop_order_info).nth(1)).to_have_text("Reduce 30% at 100.00 BTC for estimated PnL of -2.25 BTC")
    page.get_by_test_id("dialog-close").get_by_test_id("icon-cross").click()
    page.get_by_test_id("Advanced orders").click()
    text_locator_mark_under_100_pending = "Mark < 100.0030%MarketPending-FOK"
    text_locator_mark_over_120_pending = "Mark > 120.0030%MarketPending-FOK"

    expect(page.locator(f"text={text_locator_mark_under_100_pending}")).to_be_visible()
    expect(page.locator(f"text={text_locator_mark_over_120_pending}")).to_be_visible()