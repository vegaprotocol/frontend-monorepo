import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from actions.utils import (
    wait_for_toast_confirmation,
    change_keys,
    create_and_faucet_wallet,
)
from wallet_config import WalletConfig

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


def create_position(shared_vega: VegaServiceNull, market_id, key):
    submit_order(shared_vega, key, market_id, "SIDE_SELL", 100, 110)
    submit_order(shared_vega, key, market_id, "SIDE_BUY", 100, 110)
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_submit_stop_order_market_oco_rejected(
    shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_auth, shared_risk_accepted
):
    stop_order_market_oco_rejected = WalletConfig(
        "stop_order_market_oco_rejected", "stop_order_market_oco_rejected"
    )
    create_and_faucet_wallet(vega=shared_vega, wallet=stop_order_market_oco_rejected)
    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(shared_page, shared_vega, stop_order_market_oco_rejected.name)
    shared_page.get_by_test_id(stop_orders_tab).click()
    shared_page.get_by_test_id(stop_order_btn).click()
    shared_page.get_by_test_id(stop_market_order_btn).is_visible()
    shared_page.get_by_test_id(stop_market_order_btn).click()
    shared_page.get_by_test_id(trigger_price).fill("1")
    shared_page.get_by_test_id(order_size).fill("3")
    # 7002-SORD-098
    expect(
        shared_page.get_by_test_id("stop-order-warning-message-trigger-price")
    ).to_have_text("Stop order will be triggered immediately")

    # 7002-SORD-082
    shared_page.get_by_test_id(oco).click()
    # 7002-SORD-085
    expect(shared_page.get_by_test_id(trigger_direction_fallsBelow_oco)).to_be_checked
    # 7002-SORD-086
    shared_page.get_by_test_id(trigger_price_oco).fill("200")
    shared_page.get_by_test_id(order_size_oco).fill("3")
    shared_page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    shared_page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()

    expect((shared_page.get_by_role(row_table).locator(market_name_col)).nth(1)).to_have_text(
        "BTC:DAI_2023Futr"
    )

    expect((shared_page.get_by_role(row_table).locator(expiresAt_col)).nth(1)).to_have_text("")
    expect((shared_page.get_by_role(row_table).locator(size_col)).nth(1)).to_have_text("+3")
    # 7002-SORD-083
    expect((shared_page.get_by_role(row_table).locator(submission_type)).nth(1)).to_have_text(
        "Market"
    )
    expect((shared_page.get_by_role(row_table).locator(status_col)).nth(1)).to_have_text(
        "RejectedOCO"
    )
    expect((shared_page.get_by_role(row_table).locator(price_col)).nth(1)).to_have_text("-")
    expect((shared_page.get_by_role(row_table).locator(timeInForce_col)).nth(1)).to_have_text(
        "FOK"
    )
    expect(
        (shared_page.get_by_role(row_table).locator(updatedAt_col)).nth(1)
    ).not_to_be_empty()

    expect((shared_page.get_by_role(row_table).locator(market_name_col)).nth(2)).to_have_text(
        "BTC:DAI_2023Futr"
    )

    expect((shared_page.get_by_role(row_table).locator(expiresAt_col)).nth(2)).to_have_text("")
    expect((shared_page.get_by_role(row_table).locator(size_col)).nth(2)).to_have_text("+3")
    expect((shared_page.get_by_role(row_table).locator(submission_type)).nth(2)).to_have_text(
        "Market"
    )
    expect((shared_page.get_by_role(row_table).locator(status_col)).nth(2)).to_have_text(
        "RejectedOCO"
    )
    expect((shared_page.get_by_role(row_table).locator(price_col)).nth(2)).to_have_text("-")
    expect((shared_page.get_by_role(row_table).locator(timeInForce_col)).nth(2)).to_have_text(
        "FOK"
    )
    expect(
        (shared_page.get_by_role(row_table).locator(updatedAt_col)).nth(2)
    ).not_to_be_empty()
    # 7002-SORD-084
    trigger_price_list = (
        shared_page.locator(".ag-center-cols-container").locator(trigger_col).all_inner_texts()
    )
    trigger_value_list = ["Mark < 200.00", "Mark > 1.00"]
    assert trigger_price_list.sort() == trigger_value_list.sort()


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_submit_stop_oco_market_order_triggered(
    shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_auth, shared_risk_accepted
):
    stop_oco_market_order_triggered = WalletConfig(
        "stop_oco_market_order_triggered", "stop_oco_market_order_triggered"
    )
    create_and_faucet_wallet(vega=shared_vega, wallet=stop_oco_market_order_triggered)
    create_position(
        shared_vega, shared_continuous_market, stop_oco_market_order_triggered.name
    )

    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(shared_page, shared_vega, stop_oco_market_order_triggered.name)
    shared_page.get_by_test_id(stop_orders_tab).click()

    shared_page.get_by_test_id(stop_order_btn).click()
    shared_page.get_by_test_id(stop_market_order_btn).is_visible()
    shared_page.get_by_test_id(stop_market_order_btn).click()
    shared_page.get_by_test_id(trigger_price).fill("103")
    shared_page.get_by_test_id(order_size).fill("3")

    expect(
        shared_page.get_by_test_id("stop-order-warning-message-trigger-price")
    ).to_have_text("Stop order will be triggered immediately")

    shared_page.get_by_test_id(oco).click()
    expect(shared_page.get_by_test_id(trigger_direction_fallsBelow_oco)).to_be_checked

    shared_page.get_by_test_id(trigger_price_oco).fill("102")
    shared_page.get_by_test_id(order_size_oco).fill("3")
    shared_page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    shared_page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()

    expect((shared_page.get_by_role(row_table).locator(market_name_col)).nth(1)).to_have_text(
        "BTC:DAI_2023Futr"
    )

    expect((shared_page.get_by_role(row_table).locator(expiresAt_col)).nth(1)).to_have_text("")
    expect((shared_page.get_by_role(row_table).locator(size_col)).nth(1)).to_have_text("+3")
    expect((shared_page.get_by_role(row_table).locator(submission_type)).nth(1)).to_have_text(
        "Market"
    )

    expect((shared_page.get_by_role(row_table).locator(price_col)).nth(1)).to_have_text("-")
    expect((shared_page.get_by_role(row_table).locator(timeInForce_col)).nth(1)).to_have_text(
        "FOK"
    )
    expect(
        (shared_page.get_by_role(row_table).locator(updatedAt_col)).nth(1)
    ).not_to_be_empty()

    expect((shared_page.get_by_role(row_table).locator(market_name_col)).nth(2)).to_have_text(
        "BTC:DAI_2023Futr"
    )
    expect((shared_page.get_by_role(row_table).locator(expiresAt_col)).nth(2)).to_have_text("")
    expect((shared_page.get_by_role(row_table).locator(size_col)).nth(2)).to_have_text("+3")
    expect((shared_page.get_by_role(row_table).locator(submission_type)).nth(2)).to_have_text(
        "Market"
    )

    expect((shared_page.get_by_role(row_table).locator(price_col)).nth(2)).to_have_text("-")
    expect((shared_page.get_by_role(row_table).locator(timeInForce_col)).nth(2)).to_have_text(
        "FOK"
    )
    expect(
        (shared_page.get_by_role(row_table).locator(updatedAt_col)).nth(2)
    ).not_to_be_empty()

    status = (
        shared_page.locator(".ag-center-cols-container").locator(status_col).all_inner_texts()
    )
    value = ["StoppedOCO", "TriggeredOCO"]
    assert status.sort() == value.sort()

    trigger_price_list = (
        shared_page.locator(".ag-center-cols-container").locator(trigger_col).all_inner_texts()
    )
    trigger_value_list = ["Mark < 102.00", "Mark > 103.00"]
    assert trigger_price_list.sort() == trigger_value_list.sort()


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_submit_stop_oco_market_order_pending(
    shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_auth, shared_risk_accepted
):
    stop_oco_market_order_pending = WalletConfig(
        "stop_oco_market_order_pending", "stop_oco_market_order_pending"
    )
    create_and_faucet_wallet(vega=shared_vega, wallet=stop_oco_market_order_pending)
    create_position(shared_vega, shared_continuous_market, stop_oco_market_order_pending.name)

    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(shared_page, shared_vega, stop_oco_market_order_pending.name)
    shared_page.get_by_test_id(stop_orders_tab).click()
    shared_page.get_by_test_id(stop_order_btn).click()
    shared_page.get_by_test_id(stop_market_order_btn).is_visible()
    shared_page.get_by_test_id(stop_market_order_btn).click()
    shared_page.get_by_test_id(order_side_sell).click()
    shared_page.locator("label").filter(has_text="Falls below").click()
    shared_page.get_by_test_id(trigger_price).fill("99")
    shared_page.get_by_test_id(order_size).fill("3")
    shared_page.get_by_test_id(oco).click()
    expect(shared_page.get_by_test_id(trigger_direction_fallsAbove_oco)).to_be_checked
    shared_page.get_by_test_id(trigger_price_oco).fill("120")
    shared_page.get_by_test_id(order_size_oco).fill("2")
    shared_page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    shared_page.get_by_test_id(close_toast).click()
    shared_page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()

    expect((shared_page.get_by_role(row_table).locator(status_col)).nth(1)).to_have_text(
        "PendingOCO"
    )
    expect((shared_page.get_by_role(row_table).locator(status_col)).nth(2)).to_have_text(
        "PendingOCO"
    )


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_submit_stop_oco_limit_order_pending(
    shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_auth, shared_risk_accepted
):
    stop_oco_limit_order_pending = WalletConfig(
        "stop_oco_limit_order_pending", "stop_oco_limit_order_pending"
    )
    create_and_faucet_wallet(vega=shared_vega, wallet=stop_oco_limit_order_pending)
    create_position(shared_vega, shared_continuous_market, stop_oco_limit_order_pending.name)

    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(shared_page, shared_vega, stop_oco_limit_order_pending.name)
    shared_page.get_by_test_id(stop_orders_tab).click()
    shared_page.get_by_test_id(stop_order_btn).click()
    shared_page.get_by_test_id(stop_limit_order_btn).is_visible()
    shared_page.get_by_test_id(stop_limit_order_btn).click()
    shared_page.get_by_test_id(order_side_sell).click()
    shared_page.locator("label").filter(has_text="Falls below").click()
    shared_page.get_by_test_id(trigger_price).fill("102")
    shared_page.get_by_test_id(order_size).fill("3")
    shared_page.get_by_test_id(order_price).fill("103")
    shared_page.get_by_test_id(oco).click()
    # 7002-SORD-090
    expect(shared_page.get_by_test_id(trigger_direction_fallsAbove_oco)).to_be_checked
    shared_page.get_by_test_id(trigger_price_oco).fill("120")
    shared_page.get_by_test_id(order_size_oco).fill("2")
    # 7002-SORD-089
    shared_page.get_by_test_id(order_limit_price_oco).fill("99")
    shared_page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()

    shared_page.get_by_test_id(close_toast).click()
    shared_page.get_by_role(row_table).locator(market_name_col).nth(1).is_visible()

    expect((shared_page.get_by_role(row_table).locator(submission_type)).nth(1)).to_have_text(
        "Limit"
    )
    expect((shared_page.get_by_role(row_table).locator(submission_type)).nth(2)).to_have_text(
        "Limit"
    )

    price = (
        shared_page.locator(".ag-center-cols-container").locator(price_col).all_inner_texts()
    )
    prices = ["103.00", "99.00"]
    assert price.sort() == prices.sort()

    # 7002-SORD-091
    trigger_price_list = (
        shared_page.locator(".ag-center-cols-container").locator(trigger_col).all_inner_texts()
    )
    trigger_value_list = ["Limit < 102.00", "Limit > 103.00"]
    assert trigger_price_list.sort() == trigger_value_list.sort()


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_submit_stop_oco_limit_order_cancel(
    shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_auth, shared_risk_accepted
):
    stop_oco_limit_order_cancel = WalletConfig(
        "stop_oco_limit_order_cancel", "stop_oco_limit_order_cancel"
    )
    create_and_faucet_wallet(vega=shared_vega, wallet=stop_oco_limit_order_cancel)
    create_position(shared_vega, shared_continuous_market, stop_oco_limit_order_cancel.name)

    shared_page.goto(f"/#/markets/{shared_continuous_market}")
    change_keys(shared_page, shared_vega, stop_oco_limit_order_cancel.name)
    shared_page.get_by_test_id(stop_order_btn).click()
    shared_page.get_by_test_id(stop_limit_order_btn).is_visible()
    shared_page.get_by_test_id(stop_limit_order_btn).click()
    shared_page.get_by_test_id(order_side_sell).click()
    shared_page.locator("label").filter(has_text="Falls below").click()
    shared_page.get_by_test_id(trigger_price).fill("102")
    shared_page.get_by_test_id(order_size).fill("3")
    shared_page.get_by_test_id(order_price).fill("103")
    shared_page.get_by_test_id(oco).click()
    # 7002-SORD-092
    expect(shared_page.get_by_test_id(trigger_direction_fallsAbove_oco)).to_be_checked
    # 7002-SORD-094
    shared_page.get_by_test_id(trigger_price_oco).fill("120")
    shared_page.get_by_test_id(order_size_oco).fill("2")
    # 7002-SORD-093
    shared_page.get_by_test_id(order_limit_price_oco).fill("99")
    shared_page.get_by_test_id(submit_stop_order).click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    shared_page.get_by_test_id(close_toast).click()
    shared_page.get_by_test_id(stop_orders_tab).click()
    shared_page.get_by_test_id(cancel).first.click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    expect(
        shared_page.locator(".ag-center-cols-container").locator('[col-id="status"]').first
    ).to_have_text("CancelledOCO")
    expect(
        shared_page.locator(".ag-center-cols-container").locator('[col-id="status"]').last
    ).to_have_text("CancelledOCO")
