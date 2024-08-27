import pytest
import re
from playwright.sync_api import Page, expect, Locator
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from actions.utils import change_keys


def check_pnl_cell(element: Locator, dir, expected_value):
    expect(element).to_have_text(expected_value)
    if dir == "up":
        expect(element).to_have_class(re.compile(r"text-dir-up-fg"))
    elif dir == "down":
        expect(element).to_have_class(re.compile(r"text-dir-down-fg"))

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

    page.pause()

    check_pnl_cell(realised_pnl, "none", "0.00")
    check_pnl_cell(unrealised_pnl, "down", "-4.00")

    # profit Trading unrealised
    page.locator("label").filter(has_text="Show closed positions").click()
    change_keys(page, vega, "market_maker")
    check_pnl_cell(realised_pnl, "none", "0.00")
    check_pnl_cell(unrealised_pnl, "up", "4.00")

    # neutral Trading unrealised
    change_keys(page, vega, "market_maker_2")
    check_pnl_cell(realised_pnl, "none", "0.00")
    check_pnl_cell(unrealised_pnl, "none", "0.00")

    # Portfolio Unrealised
    page.get_by_role("link", name="Portfolio").click()
    page.get_by_test_id("Positions").click()
    page.wait_for_selector(
        '[data-testid="tab-positions"] .ag-center-cols-container .ag-row',
        state="visible",
    )

    page.pause()

    key_1_cell = page.get_by_role('gridcell', name="Key 1", exact=True)
    key_1 = page.get_by_role('row').filter(has=key_1_cell)

    key_mm_cell = page.get_by_role('gridcell', name='market_maker', exact=True)
    key_mm = page.get_by_role('row').filter(has=key_mm_cell)

    key_mm2_cell = page.get_by_role('gridcell', name='market_maker_2', exact=True)
    key_mm2 = page.get_by_role('row').filter(has=key_mm2_cell)

    key_1_unrealised_pnl = key_1.locator('[col-id="unrealisedPNL"]')
    key_1_realised_pnl = key_1.locator('[col-id="realisedPNL"]')
    key_mm_unrealised_pnl = key_mm.locator('[col-id="unrealisedPNL"]')
    key_mm_realised_pnl = key_mm.locator('[col-id="realisedPNL"]')
    key_mm2_unrealised_pnl = key_mm2.locator('[col-id="unrealisedPNL"]')
    key_mm2_realised_pnl = key_mm2.locator('[col-id="realisedPNL"]')

    check_pnl_cell(key_1_realised_pnl, "none", "0.00")
    check_pnl_cell(key_1_unrealised_pnl, "down", "-4.00")

    check_pnl_cell(key_mm_realised_pnl, "none", "0.00")
    check_pnl_cell(key_mm_unrealised_pnl, "up", "4.00")

    check_pnl_cell(key_mm2_realised_pnl, "none", "0.00")
    check_pnl_cell(key_mm2_unrealised_pnl, "none", "0.00")

    submit_order(vega, "Key 1", continuous_market, "SIDE_SELL", 2, 101.50000)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    check_pnl_cell(key_1_realised_pnl, "down", "-8.00")
    check_pnl_cell(key_1_unrealised_pnl, "none", "0.00")

    check_pnl_cell(key_mm_realised_pnl, "up", "8.00")
    check_pnl_cell(key_mm_unrealised_pnl, "none", "0.00")

    check_pnl_cell(key_mm2_realised_pnl, "none", "0.00")
    check_pnl_cell(key_mm2_unrealised_pnl, "none", "0.00")

    page.get_by_role("link", name="Trading").click()

    row = (
        page.get_by_test_id("tab-positions")
        .locator(".ag-center-cols-container .ag-row")
        .nth(0)
    )
    realised_pnl = row.locator("[col-id='realisedPNL']")
    unrealised_pnl = row.locator("[col-id='unrealisedPNL']")

    # neutral trading realised
    check_pnl_cell(realised_pnl, "none", "0.00")
    check_pnl_cell(unrealised_pnl, "none", "0.00")

    # profit trading realised
    change_keys(page, vega, "market_maker")
    check_pnl_cell(realised_pnl, "up", "8.00")
    check_pnl_cell(unrealised_pnl, "none", "0.00")

    # loss trading realised
    change_keys(page, vega, "Key 1")
    check_pnl_cell(realised_pnl, "down", "-8.00")
    check_pnl_cell(unrealised_pnl, "none", "0.00")
