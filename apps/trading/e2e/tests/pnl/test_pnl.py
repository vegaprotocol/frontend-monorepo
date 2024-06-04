import pytest
from playwright.sync_api import Page
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from actions.utils import change_keys


def check_pnl_color_value(element, expected_color, expected_value):
    color = element.evaluate("element => getComputedStyle(element).color")
    value = element.inner_text()
    assert color == expected_color, f"Unexpected color: {color}"
    assert value == expected_value, f"Unexpected value: {value}"

# TODO move this test to jest


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_pnl(continuous_market, vega: VegaServiceNull, page: Page):
    page.set_viewport_size({"width": 1748, "height": 977})
    submit_order(vega, "Key 1", continuous_market, "SIDE_BUY", 1, 104.50000)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.goto(f"/#/markets/{continuous_market}")
    # Loss Trading unrealised
    row = (
        page.get_by_test_id("tab-positions")
        .locator(".ag-center-cols-container .ag-row")
        .nth(0)
    )
    realised_pnl = row.locator("[col-id='realisedPNL']")
    unrealised_pnl = row.locator("[col-id='unrealisedPNL']")

    check_pnl_color_value(realised_pnl, "rgb(0, 0, 0)", "0.00")
    check_pnl_color_value(unrealised_pnl, "rgb(236, 0, 60)", "-4.00")

    # profit Trading unrealised
    page.locator("label").filter(has_text="Show closed positions").click()
    change_keys(page, vega, "market_maker")
    check_pnl_color_value(realised_pnl, "rgb(0, 0, 0)", "0.00")
    check_pnl_color_value(unrealised_pnl, "rgb(1, 145, 75)", "4.00")

    # neutral Trading unrealised
    change_keys(page, vega, "market_maker_2")
    check_pnl_color_value(realised_pnl, "rgb(0, 0, 0)", "0.00")
    check_pnl_color_value(unrealised_pnl, "rgb(0, 0, 0)", "0.00")

    # Portfolio Unrealised
    page.get_by_role("link", name="Portfolio").click()
    page.get_by_test_id("Positions").click()
    page.wait_for_selector(
        '[data-testid="tab-positions"] .ag-center-cols-container .ag-row',
        state="visible",
    )

    key_1 = page.query_selector(
        '//div[@role="row" and .//div[@col-id="partyId"]/div/span[text()="Key 1"]]'
    )
    key_mm = page.query_selector(
        '//div[@role="row" and .//div[@col-id="partyId"]/div/span[text()="market_maker"]]'
    )
    key_mm2 = page.query_selector(
        '//div[@role="row" and .//div[@col-id="partyId"]/div/span[text()="market_maker_2"]]'
    )

    key_1_unrealised_pnl = key_1.query_selector(
        'xpath=./div[@col-id="unrealisedPNL"]')
    key_1_realised_pnl = key_1.query_selector(
        'xpath=./div[@col-id="realisedPNL"]')
    key_mm_unrealised_pnl = key_mm.query_selector(
        'xpath=./div[@col-id="unrealisedPNL"]'
    )
    key_mm_realised_pnl = key_mm.query_selector(
        'xpath=./div[@col-id="realisedPNL"]')
    key_mm2_unrealised_pnl = key_mm2.query_selector(
        'xpath=./div[@col-id="unrealisedPNL"]'
    )
    key_mm2_realised_pnl = key_mm2.query_selector(
        'xpath=./div[@col-id="realisedPNL"]')
    check_pnl_color_value(key_1_realised_pnl, "rgb(0, 0, 0)", "0.00")
    check_pnl_color_value(key_1_unrealised_pnl, "rgb(236, 0, 60)", "-4.00")

    check_pnl_color_value(key_mm_realised_pnl, "rgb(0, 0, 0)", "0.00")
    check_pnl_color_value(key_mm_unrealised_pnl, "rgb(1, 145, 75)", "4.00")

    check_pnl_color_value(key_mm2_realised_pnl, "rgb(0, 0, 0)", "0.00")
    check_pnl_color_value(key_mm2_unrealised_pnl, "rgb(0, 0, 0)", "0.00")

    submit_order(vega, "Key 1", continuous_market, "SIDE_SELL", 2, 101.50000)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    check_pnl_color_value(key_1_realised_pnl, "rgb(236, 0, 60)", "-8.00")
    check_pnl_color_value(key_1_unrealised_pnl, "rgb(0, 0, 0)", "0.00")

    check_pnl_color_value(key_mm_realised_pnl, "rgb(1, 145, 75)", "8.00")
    check_pnl_color_value(key_mm_unrealised_pnl, "rgb(0, 0, 0)", "0.00")

    check_pnl_color_value(key_mm2_realised_pnl, "rgb(0, 0, 0)", "0.00")
    check_pnl_color_value(key_mm2_unrealised_pnl, "rgb(0, 0, 0)", "0.00")

    page.get_by_role("link", name="Trading").click()

    row = (
        page.get_by_test_id("tab-positions")
        .locator(".ag-center-cols-container .ag-row")
        .nth(0)
    )
    realised_pnl = row.locator("[col-id='realisedPNL']")
    unrealised_pnl = row.locator("[col-id='unrealisedPNL']")

    # neutral trading realised
    check_pnl_color_value(realised_pnl, "rgb(0, 0, 0)", "0.00")
    check_pnl_color_value(unrealised_pnl, "rgb(0, 0, 0)", "0.00")

    # profit trading realised
    change_keys(page, vega, "market_maker")
    check_pnl_color_value(realised_pnl, "rgb(1, 145, 75)", "8.00")
    check_pnl_color_value(unrealised_pnl, "rgb(0, 0, 0)", "0.00")

    # loss trading realised
    change_keys(page, vega, "Key 1")
    check_pnl_color_value(realised_pnl, "rgb(236, 0, 60)", "-8.00")
    check_pnl_color_value(unrealised_pnl, "rgb(0, 0, 0)", "0.00")
