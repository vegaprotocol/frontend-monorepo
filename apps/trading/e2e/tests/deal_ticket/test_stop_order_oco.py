import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from actions.vega import submit_order
from conftest import init_vega
from fixtures.market import setup_continuous_market
from actions.utils import wait_for_toast_confirmation
from wallet_config import MM_WALLET, MM_WALLET2, TERMINATE_WALLET, wallets

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
trigger_direction_fallsBelow_oco = "triggerDirection-fallsBelow-oco"
trigger_direction_fallsAbove_oco = "triggerDirection-fallsAbove-oco"
oco = "oco"
trigger_price_oco = "triggerPrice-oco"
order_size_oco = "order-size-oco"
order_limit_price_oco = "order-price-oco"

def create_position(vega: VegaService, market_id):
    submit_order(vega, "Key 1", market_id, "SIDE_SELL", 100, 110)
    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 100, 110)
    vega.wait_fn(1)
    vega.wait_for_total_catchup


@pytest.mark.usefixtures("page", "vega", "continuous_market", "auth", "risk_accepted")
def test_submit_stop_order_market_oco_rejected(
    continuous_market, vega: VegaService, page: Page
):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_orders_tab).click()
    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_market_order_btn).is_visible()
    page.get_by_test_id(stop_market_order_btn).click()
    page.get_by_test_id(trigger_price).fill("103")
    page.get_by_test_id(order_size).fill("3")
    # 7002-SORD-098
    expect(
        page.get_by_test_id("stop-order-warning-message-trigger-price")
    ).to_have_text("Stop order will be triggered immediately")

    # 7002-SORD-082
    page.get_by_test_id(oco).click()
    # 7002-SORD-085
    expect(page.get_by_test_id(trigger_direction_fallsBelow_oco)).to_be_checked
    # 7002-SORD-086
    page.get_by_test_id(trigger_price_oco).fill("102")
    page.get_by_test_id(order_size_oco).fill("3")
    page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()

    expect((page.get_by_role(row_table).locator(market_name_col)).nth(1)).to_have_text(
        "BTC:DAI_2023Futr"
    )

    expect((page.get_by_role(row_table).locator(expiresAt_col)).nth(1)).to_have_text("")
    expect((page.get_by_role(row_table).locator(size_col)).nth(1)).to_have_text("+3")
    # 7002-SORD-083
    expect((page.get_by_role(row_table).locator(submission_type)).nth(1)).to_have_text(
        "Market"
    )
    expect((page.get_by_role(row_table).locator(status_col)).nth(1)).to_have_text(
        "RejectedOCO"
    )
    expect((page.get_by_role(row_table).locator(price_col)).nth(1)).to_have_text("-")
    expect((page.get_by_role(row_table).locator(timeInForce_col)).nth(1)).to_have_text(
        "FOK"
    )
    expect(
        (page.get_by_role(row_table).locator(updatedAt_col)).nth(1)
    ).not_to_be_empty()

    expect((page.get_by_role(row_table).locator(market_name_col)).nth(2)).to_have_text(
        "BTC:DAI_2023Futr"
    )

    expect((page.get_by_role(row_table).locator(expiresAt_col)).nth(2)).to_have_text("")
    expect((page.get_by_role(row_table).locator(size_col)).nth(2)).to_have_text("+3")
    expect((page.get_by_role(row_table).locator(submission_type)).nth(2)).to_have_text(
        "Market"
    )
    expect((page.get_by_role(row_table).locator(status_col)).nth(2)).to_have_text(
        "RejectedOCO"
    )
    expect((page.get_by_role(row_table).locator(price_col)).nth(2)).to_have_text("-")
    expect((page.get_by_role(row_table).locator(timeInForce_col)).nth(2)).to_have_text(
        "FOK"
    )
    expect(
        (page.get_by_role(row_table).locator(updatedAt_col)).nth(2)
    ).not_to_be_empty()
    # 7002-SORD-084
    trigger_price_list = (
        page.locator(".ag-center-cols-container").locator(trigger_col).all_inner_texts()
    )
    trigger_value_list = ["Mark < 102.00", "Mark > 103.00"]
    assert trigger_price_list.sort() == trigger_value_list.sort()


@pytest.mark.usefixtures("page", "vega", "continuous_market", "auth", "risk_accepted")
def test_submit_stop_oco_market_order_triggered(
    continuous_market, vega: VegaService, page: Page
):
    create_position(vega, continuous_market)
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_orders_tab).click()
    
    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_market_order_btn).is_visible()
    page.get_by_test_id(stop_market_order_btn).click()
    page.get_by_test_id(trigger_price).fill("103")
    page.get_by_test_id(order_size).fill("3")

    expect(
        page.get_by_test_id("stop-order-warning-message-trigger-price")
    ).to_have_text("Stop order will be triggered immediately")

    page.get_by_test_id(oco).click()
    expect(page.get_by_test_id(trigger_direction_fallsBelow_oco)).to_be_checked

    page.get_by_test_id(trigger_price_oco).fill("102")
    page.get_by_test_id(order_size_oco).fill("3")
    page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()

    expect((page.get_by_role(row_table).locator(market_name_col)).nth(1)).to_have_text(
        "BTC:DAI_2023Futr"
    )

    expect((page.get_by_role(row_table).locator(expiresAt_col)).nth(1)).to_have_text("")
    expect((page.get_by_role(row_table).locator(size_col)).nth(1)).to_have_text("+3")
    expect((page.get_by_role(row_table).locator(submission_type)).nth(1)).to_have_text(
        "Market"
    )

    expect((page.get_by_role(row_table).locator(price_col)).nth(1)).to_have_text("-")
    expect((page.get_by_role(row_table).locator(timeInForce_col)).nth(1)).to_have_text(
        "FOK"
    )
    expect(
        (page.get_by_role(row_table).locator(updatedAt_col)).nth(1)
    ).not_to_be_empty()

    expect((page.get_by_role(row_table).locator(market_name_col)).nth(2)).to_have_text(
        "BTC:DAI_2023Futr"
    )
    expect((page.get_by_role(row_table).locator(expiresAt_col)).nth(2)).to_have_text("")
    expect((page.get_by_role(row_table).locator(size_col)).nth(2)).to_have_text("+3")
    expect((page.get_by_role(row_table).locator(submission_type)).nth(2)).to_have_text(
        "Market"
    )

    expect((page.get_by_role(row_table).locator(price_col)).nth(2)).to_have_text("-")
    expect((page.get_by_role(row_table).locator(timeInForce_col)).nth(2)).to_have_text(
        "FOK"
    )
    expect(
        (page.get_by_role(row_table).locator(updatedAt_col)).nth(2)
    ).not_to_be_empty()

    status = (
        page.locator(".ag-center-cols-container").locator(status_col).all_inner_texts()
    )
    value = ["StoppedOCO", "TriggeredOCO"]
    assert status.sort() == value.sort()

    trigger_price_list = (
        page.locator(".ag-center-cols-container").locator(trigger_col).all_inner_texts()
    )
    trigger_value_list = ["Mark < 102.00", "Mark > 103.00"]
    assert trigger_price_list.sort() == trigger_value_list.sort()


@pytest.mark.usefixtures("page", "vega", "continuous_market", "auth", "risk_accepted")
def test_submit_stop_oco_market_order_pending(
    continuous_market, vega: VegaService, page: Page
):  
    create_position(vega, continuous_market)
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_orders_tab).click()
    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_market_order_btn).is_visible()
    page.get_by_test_id(stop_market_order_btn).click()
    page.get_by_test_id(order_side_sell).click()
    page.locator("label").filter(has_text="Falls below").click()
    page.get_by_test_id(trigger_price).fill("99")
    page.get_by_test_id(order_size).fill("3")
    page.get_by_test_id(oco).click()
    expect(page.get_by_test_id(trigger_direction_fallsAbove_oco)).to_be_checked
    page.get_by_test_id(trigger_price_oco).fill("120")
    page.get_by_test_id(order_size_oco).fill("2")
    page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id(close_toast).click()
    page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()

    expect((page.get_by_role(row_table).locator(status_col)).nth(1)).to_have_text(
        "PendingOCO"
    )
    expect((page.get_by_role(row_table).locator(status_col)).nth(2)).to_have_text(
        "PendingOCO"
    )

@pytest.mark.usefixtures("page", "vega", "continuous_market", "auth", "risk_accepted")
def test_submit_stop_oco_limit_order_pending(
    continuous_market, vega: VegaService, page: Page
):
    create_position(vega, continuous_market)
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_orders_tab).click()
    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_limit_order_btn).is_visible()
    page.get_by_test_id(stop_limit_order_btn).click()
    page.get_by_test_id(order_side_sell).click()
    page.locator("label").filter(has_text="Falls below").click()
    page.get_by_test_id(trigger_price).fill("102")
    page.get_by_test_id(order_size).fill("3")
    page.get_by_test_id(order_price).fill("103")
    page.get_by_test_id(oco).click()
    # 7002-SORD-090
    expect(page.get_by_test_id(trigger_direction_fallsAbove_oco)).to_be_checked
    page.get_by_test_id(trigger_price_oco).fill("120")
    page.get_by_test_id(order_size_oco).fill("2")
    # 7002-SORD-089
    page.get_by_test_id(order_limit_price_oco).fill("99")
    page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    page.get_by_test_id(close_toast).click()
    page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()

    expect((page.get_by_role(row_table).locator(submission_type)).nth(1)).to_have_text(
        "Limit"
    )
    expect((page.get_by_role(row_table).locator(submission_type)).nth(2)).to_have_text(
        "Limit"
    )

    price = (
        page.locator(".ag-center-cols-container").locator(price_col).all_inner_texts()
    )
    prices = ["103.00", "99.00"]
    assert price.sort() == prices.sort()

    # 7002-SORD-091
    trigger_price_list = (
        page.locator(".ag-center-cols-container").locator(trigger_col).all_inner_texts()
    )
    trigger_value_list = ["Limit < 102.00", "Limit > 103.00"]
    assert trigger_price_list.sort() == trigger_value_list.sort()


@pytest.mark.usefixtures("page", "vega", "continuous_market", "auth", "risk_accepted")
def test_submit_stop_oco_limit_order_cancel(
    continuous_market, vega: VegaService, page: Page
):
    create_position(vega, continuous_market)
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(stop_order_btn).click()
    page.get_by_test_id(stop_limit_order_btn).is_visible()
    page.get_by_test_id(stop_limit_order_btn).click()
    page.get_by_test_id(order_side_sell).click()
    page.locator("label").filter(has_text="Falls below").click()
    page.get_by_test_id(trigger_price).fill("102")
    page.get_by_test_id(order_size).fill("3")
    page.get_by_test_id(order_price).fill("103")
    page.get_by_test_id(oco).click()
    # 7002-SORD-092
    expect(page.get_by_test_id(trigger_direction_fallsAbove_oco)).to_be_checked
    # 7002-SORD-094
    page.get_by_test_id(trigger_price_oco).fill("120")
    page.get_by_test_id(order_size_oco).fill("2")
    # 7002-SORD-093
    page.get_by_test_id(order_limit_price_oco).fill("99")
    page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.get_by_test_id(close_toast).click()
    page.get_by_test_id(stop_orders_tab).click()
    page.get_by_test_id(cancel).first.click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(
        page.locator(".ag-center-cols-container").locator('[col-id="status"]').first
    ).to_have_text("CancelledOCO")
    expect(
        page.locator(".ag-center-cols-container").locator('[col-id="status"]').last
    ).to_have_text("CancelledOCO")

class TestStopOcoValidation:
    @pytest.fixture(scope="class")
    def vega(self, request):
        with init_vega(request) as vega:
            yield vega

    @pytest.fixture(scope="class")
    def continuous_market(self, vega):
        return setup_continuous_market(vega)

    @pytest.mark.usefixtures("page", "auth", "risk_accepted")
    def test_stop_market_order_oco_form_validation(self, continuous_market, page: Page):
        page.goto(f"/#/markets/{continuous_market}")
        page.get_by_test_id(stop_order_btn).click()
        page.get_by_test_id(stop_market_order_btn).is_visible()
        page.get_by_test_id(stop_market_order_btn).click()
        page.get_by_test_id(oco).click()
        expect(
            page.get_by_test_id("sidebar-content").get_by_text("Trigger").last
        ).to_be_visible()
        # 7002-SORD-084
        expect(page.locator('[for="triggerDirection-risesAbove-oco"]')).to_have_text(
            "Rises above"
        )
        # 7002-SORD-085
        expect(page.locator('[for="triggerDirection-fallsBelow-oco"]')).to_have_text(
            "Falls below"
        )
        # 7002-SORD-087
        expect(page.locator('[for="triggerType-price-oco"]')).to_have_text("Price")
        expect(page.locator('[for="triggerType-price"]')).to_be_checked
        # 7002-SORD-088
        expect(
            page.locator('[for="triggerType-trailingPercentOffset-oco"]')
        ).to_have_text("Trailing Percent Offset")
        expect(page.locator('[for="order-size-oco"]')).to_have_text("Size")

    @pytest.mark.usefixtures("page", "auth", "risk_accepted")
    def test_stop_limit_order_oco_form_validation(self, continuous_market, page: Page):
        page.goto(f"/#/markets/{continuous_market}")
        page.get_by_test_id(stop_order_btn).click()
        page.get_by_test_id(stop_market_order_btn).is_visible()
        page.get_by_test_id(stop_limit_order_btn).click()
        page.get_by_test_id(oco).click()
        expect(
            page.get_by_test_id("sidebar-content").get_by_text("Trigger").last
        ).to_be_visible()
        # 7002-SORD-099
        expect(page.locator('[for="triggerDirection-risesAbove-oco"]')).to_have_text(
            "Rises above"
        )
        # 7002-SORD-091
        expect(page.locator('[for="triggerDirection-fallsBelow-oco"]')).to_have_text(
            "Falls below"
        )
        # 7002-SORD-095
        expect(page.locator('[for="triggerType-price-oco"]')).to_have_text("Price")
        expect(page.locator('[for="triggerType-price"]')).to_be_checked
        # 7002-SORD-095
        expect(
            page.locator('[for="triggerType-trailingPercentOffset-oco"]')
        ).to_have_text("Trailing Percent Offset")

        expect(page.locator('[for="order-size-oco"]')).to_have_text("Size")
        expect(page.locator('[for="order-price-oco"]')).to_have_text("Price")
    
    @pytest.mark.usefixtures("page", "auth", "risk_accepted")
    def test_maximum_number_of_active_stop_orders_oco(
        self, continuous_market, vega: VegaService, page: Page
    ):  
        page.goto(f"/#/markets/{continuous_market}")   
        page.get_by_test_id(stop_order_btn).click()
        page.get_by_test_id(stop_limit_order_btn).is_visible()
        page.get_by_test_id(stop_limit_order_btn).click()
        page.get_by_test_id(order_side_sell).click()
        page.locator("label").filter(has_text="Falls below").click()
        page.get_by_test_id(trigger_price).fill("102")
        page.get_by_test_id(order_size).fill("3")
        page.get_by_test_id(order_price).fill("103")
        page.get_by_test_id(oco).click()
        page.get_by_test_id(trigger_price_oco).fill("120")
        page.get_by_test_id(order_size_oco).fill("2")
        page.get_by_test_id(order_limit_price_oco).fill("99")
        for i in range(2):
            page.get_by_test_id(submit_stop_order).click()
            wait_for_toast_confirmation(page)
            vega.wait_fn(1)
            vega.forward("20s")
            vega.wait_for_total_catchup()
            if page.get_by_test_id(close_toast).is_visible():
               page.get_by_test_id(close_toast).click()
        # 7002-SORD-011
        expect(page.get_by_test_id("stop-order-warning-limit")).to_have_text(
            "There is a limit of 4 active stop orders per market. Orders submitted above the limit will be immediately rejected."
        )
