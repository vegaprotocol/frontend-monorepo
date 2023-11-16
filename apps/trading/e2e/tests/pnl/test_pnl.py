import pytest
from playwright.sync_api import Page
from vega_sim.service import VegaService
from actions.vega import submit_order

def check_pnl_color_value(element, expected_color, expected_value):
    color = element.evaluate("element => getComputedStyle(element).color")
    value = element.inner_text()
    assert color == expected_color, f"Unexpected color: {color}"
    assert value == expected_value, f"Unexpected value: {value}"

@pytest.mark.usefixtures("vega", "page", "continuous_market", "auth", "risk_accepted")
def test_pnl(continuous_market, vega: VegaService, page: Page):
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
    page.get_by_test_id("manage-vega-wallet").click()
    page.locator('[role="menuitemradio"] >> .mr-2.uppercase').nth(1).click(position={ "x": 0, "y": 0}, force=True)
    check_pnl_color_value(realised_pnl, "rgb(0, 0, 0)", "0.00")
    check_pnl_color_value(unrealised_pnl, "rgb(1, 145, 75)", "4.00")

    # neutral Trading unrealised
    page.locator('[role="menuitemradio"] >> .mr-2.uppercase').nth(2).click(position={ "x": 0, "y": 0}, force=True)
    check_pnl_color_value(realised_pnl, "rgb(0, 0, 0)", "0.00")
    check_pnl_color_value(unrealised_pnl, "rgb(0, 0, 0)", "0.00")

    # Portfolio Unrealised
    page.get_by_test_id("manage-vega-wallet").click(force=True)
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
        '//div[@role="row" and .//div[@col-id="partyId"]/div/span[text()="mm"]]'
    )
    key_mm2 = page.query_selector(
        '//div[@role="row" and .//div[@col-id="partyId"]/div/span[text()="mm2"]]'
    )

    key_1_unrealised_pnl = key_1.query_selector('xpath=./div[@col-id="unrealisedPNL"]')
    key_1_realised_pnl = key_1.query_selector('xpath=./div[@col-id="realisedPNL"]')
    key_mm_unrealised_pnl = key_mm.query_selector('xpath=./div[@col-id="unrealisedPNL"]')
    key_mm_realised_pnl = key_mm.query_selector('xpath=./div[@col-id="realisedPNL"]')
    key_mm2_unrealised_pnl = key_mm2.query_selector('xpath=./div[@col-id="unrealisedPNL"]')
    key_mm2_realised_pnl = key_mm2.query_selector('xpath=./div[@col-id="realisedPNL"]')
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
    page.get_by_test_id("manage-vega-wallet").click()
    page.locator('[role="menuitemradio"] >> .mr-2.uppercase').nth(1).click(position={ "x": 0, "y": 0}, force=True)
    check_pnl_color_value(realised_pnl, "rgb(1, 145, 75)", "8.00")
    check_pnl_color_value(unrealised_pnl, "rgb(0, 0, 0)", "0.00")

    # loss trading realised
    page.locator('[role="menuitemradio"] >> .mr-2.uppercase').nth(0).click(position={ "x": 0, "y": 0}, force=True)
    check_pnl_color_value(realised_pnl, "rgb(236, 0, 60)", "-8.00")
    check_pnl_color_value(unrealised_pnl, "rgb(0, 0, 0)", "0.00")
