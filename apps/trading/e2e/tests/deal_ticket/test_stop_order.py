import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from actions.vega import submit_order
from datetime import datetime, timedelta
from conftest import init_vega
from fixtures.market import setup_continuous_market

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
stop_orders_tab = "Stop orders"
row_table = "row"
cancel = "cancel"
market_name_col = '[col-id="market.tradableInstrument.instrument.code"]'
trigger_col = '[col-id="trigger"]'
expiresAt_col = '[col-id="expiresAt"]'
size_col = '[col-id="submission.size"]'
submission_type = '[col-id="submission.type"]'
status_col = '[col-id="status"]'
price_col = '[col-id="submission.price"]'
timeInForce_col = '[col-id="submission.timeInForce"]'
updatedAt_col = '[col-id="updatedAt"]'
close_toast = "toast-close"

def create_position(vega: VegaService, market_id):
    submit_order(vega, "Key 1", market_id, "SIDE_SELL", 100, 110)
    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 100, 110)
    vega.forward("10s")
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
        "You need provide a price"
    )
    expect(page.get_by_test_id("stop-order-error-message-size")).to_have_text(
        "Size cannot be lower than 1"
    )

    page.get_by_test_id(order_size).fill("1")
    page.get_by_test_id(order_price).fill("0.0000001")
    expect(page.get_by_test_id("stop-order-error-message-price")).to_have_text(
        "Price cannot be lower than 0.00001"
    )

@pytest.mark.skip("core issue")
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_submit_stop_order_rejected(continuous_market, vega: VegaService, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_orders_tab).click()
    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_market_order_btn).is_visible()
    page.get_by_test_id(stop_market_order_btn).click()
    page.get_by_test_id(trigger_price).fill("103")
    page.get_by_test_id(order_size).fill("3")
    page.get_by_test_id(submit_stop_order).click()
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id(close_toast).click()
    page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()
    expect((page.get_by_role(row_table).locator(market_name_col)).nth(1)).to_have_text(
        "BTC:DAI_2023Futr"
    )
    expect((page.get_by_role(row_table).locator(trigger_col)).nth(1)).to_have_text(
        "Mark > 103.00"
    )
    expect((page.get_by_role(row_table).locator(expiresAt_col)).nth(1)).to_have_text("")
    expect((page.get_by_role(row_table).locator(size_col)).nth(1)).to_have_text("+3")
    expect((page.get_by_role(row_table).locator(submission_type)).nth(1)).to_have_text(
        "Market"
    )
    expect((page.get_by_role(row_table).locator(status_col)).nth(1)).to_have_text(
        "Rejected"
    )
    expect((page.get_by_role(row_table).locator(price_col)).nth(1)).to_have_text("-")
    expect((page.get_by_role(row_table).locator(timeInForce_col)).nth(1)).to_have_text(
        "FOK"
    )
    expect(
        (page.get_by_role(row_table).locator(updatedAt_col)).nth(1)
    ).not_to_be_empty()

@pytest.mark.skip("core issue")
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_submit_stop_market_order_triggered(
    continuous_market, vega: VegaService, page: Page
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
    page.get_by_test_id(expiry_strategy_cancel).click()
    page.get_by_test_id(submit_stop_order).click()
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.wait_for_selector('[data-testid="toast-close"]', state="visible")
    page.get_by_test_id(close_toast).click()

    page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()
    expect((page.get_by_role(row_table).locator(market_name_col)).nth(1)).to_have_text(
        "BTC:DAI_2023Futr"
    )
    expect((page.get_by_role(row_table).locator(trigger_col)).nth(1)).to_have_text(
        "Mark > 103.00"
    )
    expect((page.get_by_role(row_table).locator(expiresAt_col)).nth(1)).to_contain_text(
        "Cancels"
    )
    expect((page.get_by_role(row_table).locator(size_col)).nth(1)).to_have_text("-1")
    expect((page.get_by_role(row_table).locator(submission_type)).nth(1)).to_have_text(
        "Market"
    )
    expect((page.get_by_role(row_table).locator(status_col)).nth(1)).to_have_text(
        "Triggered"
    )
    expect((page.get_by_role(row_table).locator(price_col)).nth(1)).to_have_text("-")
    expect((page.get_by_role(row_table).locator(timeInForce_col)).nth(1)).to_have_text(
        "FOK"
    )
    expect(
        (page.get_by_role(row_table).locator(updatedAt_col)).nth(1)
    ).not_to_be_empty()

@pytest.mark.skip("core issue")
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_submit_stop_limit_order_pending(
    continuous_market, vega: VegaService, page: Page
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
    page.get_by_test_id(trigger_below).click()
    page.get_by_test_id(trigger_price).fill("102")
    page.get_by_test_id(order_price).fill("99")
    page.get_by_test_id(order_size).fill("1")
    page.get_by_test_id("order-tif").select_option("TIME_IN_FORCE_IOC")
    page.get_by_test_id(expire).click()
    expires_at = datetime.now() + timedelta(days=1)
    expires_at_input_value = expires_at.strftime("%Y-%m-%dT%H:%M:%S")
    page.get_by_test_id("date-picker-field").fill(expires_at_input_value)
    page.get_by_test_id(submit_stop_order).click()
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    page.wait_for_selector('[data-testid="toast-close"]', state="visible")
    page.get_by_test_id(close_toast).click()
    page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()
    expect((page.get_by_role(row_table).locator(market_name_col)).nth(1)).to_have_text(
        "BTC:DAI_2023Futr"
    )
    expect((page.get_by_role(row_table).locator(trigger_col)).nth(1)).to_have_text(
        "Mark < 102.00"
    )
    expect((page.get_by_role(row_table).locator(expiresAt_col)).nth(1)).to_contain_text(
        "Submit"
    )
    expect((page.get_by_role(row_table).locator(size_col)).nth(1)).to_have_text("-1")
    expect((page.get_by_role(row_table).locator(submission_type)).nth(1)).to_have_text(
        "Limit"
    )
    expect((page.get_by_role(row_table).locator(status_col)).nth(1)).to_have_text(
        "Pending"
    )
    expect((page.get_by_role(row_table).locator(price_col)).nth(1)).to_have_text(
        "99.00"
    )
    expect((page.get_by_role(row_table).locator(timeInForce_col)).nth(1)).to_have_text(
        "IOC"
    )
    expect(
        (page.get_by_role(row_table).locator(updatedAt_col)).nth(1)
    ).not_to_be_empty()

@pytest.mark.skip("core issue")
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_submit_stop_limit_order_cancel(
    continuous_market, vega: VegaService, page: Page
):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_orders_tab).click()
    # create a position because stop order is reduce only type
    create_position(vega, continuous_market)

    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_limit_order_btn).is_visible()
    page.get_by_test_id(stop_limit_order_btn).click()
    page.get_by_test_id(order_side_sell).click()
    page.get_by_test_id(trigger_below).click()
    page.get_by_test_id(trigger_price).fill("102")
    page.get_by_test_id(order_price).fill("99")
    page.get_by_test_id(order_size).fill("1")
    page.get_by_test_id(submit_stop_order).click()
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    page.get_by_test_id(close_toast).first.click()
    page.get_by_test_id(cancel).click()
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id(close_toast).first.click()

    expect(
        (page.get_by_role(row_table).locator('[col-id="status"]')).nth(1)
    ).to_have_text("Cancelled")


class TestStopOcoValidation:
    @pytest.fixture(scope="class")
    def vega(self, request, local_server):
        with init_vega(request, local_server) as vega:
            yield vega

    @pytest.fixture(scope="class")
    def continuous_market(self, vega):
        return setup_continuous_market(vega)

    @pytest.mark.usefixtures("auth", "risk_accepted")
    def test_stop_market_order_form_validation(self, continuous_market, page: Page):
        # 7002-SORD-052
        # 7002-SORD-055
        # 7002-SORD-056
        # 7002-SORD-057
        # 7002-SORD-058
        # 7002-SORD-064
        # 7002-SORD-065
        page.goto(f"/#/markets/{continuous_market}")
        page.get_by_test_id(stop_order_btn).click()
        page.get_by_test_id(stop_market_order_btn).is_visible()
        page.get_by_test_id(stop_market_order_btn).click()
        expect(
            page.get_by_test_id("sidebar-content").get_by_text("Trigger").first
        ).to_be_visible()
        expect(page.locator('[for="triggerDirection-risesAbove"]')).to_have_text(
            "Rises above"
        )
        expect(page.locator('[for="triggerDirection-fallsBelow"]')).to_have_text(
            "Falls below"
        )
        page.get_by_test_id(trigger_price).click()
        expect(page.get_by_test_id(trigger_price)).to_be_empty
        expect(page.locator('[for="triggerType-price"]')).to_have_text("Price")
        expect(page.locator('[for="triggerType-trailingPercentOffset"]')).to_have_text(
            "Trailing Percent Offset"
        )
        expect(page.locator('[for="order-size"]')).to_have_text("Size")
        page.get_by_test_id(order_size).click()
        expect(page.get_by_test_id(order_size)).to_be_empty
        expect(page.get_by_test_id(order_price)).not_to_be_visible()

    @pytest.mark.usefixtures("auth", "risk_accepted")
    def test_stop_limit_order_form_validation(self, continuous_market, page: Page):
        # 7002-SORD-020
        # 7002-SORD-021
        # 7002-SORD-022
        # 7002-SORD-033
        # 7002-SORD-034
        # 7002-SORD-035
        # 7002-SORD-036
        # 7002-SORD-037
        # 7002-SORD-038
        # 7002-SORD-049
        # 7002-SORD-050
        # 7002-SORD-051

        page.goto(f"/#/markets/{continuous_market}")
        page.get_by_test_id(stop_order_btn).click()
        page.get_by_test_id(stop_limit_order_btn).is_visible()
        page.get_by_test_id(stop_limit_order_btn).click()
        expect(
            page.get_by_test_id("sidebar-content").get_by_text("Trigger").first
        ).to_be_visible()
        expect(page.locator('[for="triggerDirection-risesAbove"]')).to_have_text(
            "Rises above"
        )
        expect(page.locator('[for="triggerDirection-risesAbove"]')).to_be_checked
        expect(page.locator('[for="triggerDirection-fallsBelow"]')).to_have_text(
            "Falls below"
        )
        page.get_by_test_id(trigger_price).click()
        expect(page.get_by_test_id(trigger_price)).to_be_empty
        expect(page.locator('[for="triggerType-price"]')).to_have_text("Price")
        expect(page.locator('[for="triggerType-price"]')).to_be_checked
        expect(page.locator('[for="triggerType-trailingPercentOffset"]')).to_have_text(
            "Trailing Percent Offset"
        )
        expect(page.locator('[for="order-size"]').first).to_have_text("Size")
        expect(page.locator('[for="order-price"]').last).to_have_text("Price")
        page.get_by_test_id(order_size).click()
        expect(page.get_by_test_id(order_size)).to_be_empty
        page.get_by_test_id(order_price).click()
        expect(page.get_by_test_id(order_price)).to_be_empty()

    @pytest.mark.skip("core issue")
    @pytest.mark.usefixtures("auth", "risk_accepted")
    def test_maximum_number_of_active_stop_orders(
        self, continuous_market, vega: VegaService, page: Page
    ):
        page.goto(f"/#/markets/{continuous_market}")
        page.get_by_test_id(stop_orders_tab).click()
        # create a position because stop order is reduce only type
        create_position(vega, continuous_market)
        for i in range(4):
            page.get_by_test_id(stop_order_btn).click()
            page.get_by_test_id(stop_limit_order_btn).is_visible()
            page.get_by_test_id(stop_limit_order_btn).click()
            page.get_by_test_id(order_side_sell).click()
            page.get_by_test_id(trigger_below).click()
            page.get_by_test_id(trigger_price).fill("102")
            page.get_by_test_id(order_price).fill("99")
            page.get_by_test_id(order_size).fill("1")
            page.get_by_test_id(submit_stop_order).click()
            vega.forward("10s")
            vega.wait_fn(1)
            vega.wait_for_total_catchup()
            if page.get_by_test_id(close_toast).is_visible():
                page.get_by_test_id(close_toast).click()
        # 7002-SORD-011
        expect(page.get_by_test_id("stop-order-warning-limit")).to_have_text(
            "There is a limit of 4 active stop orders per market. Orders submitted above the limit will be immediately rejected."
        )
