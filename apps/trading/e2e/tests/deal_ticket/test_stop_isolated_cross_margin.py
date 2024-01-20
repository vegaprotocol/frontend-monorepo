import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from actions.utils import next_epoch, wait_for_toast_confirmation

tooltip_content = "tooltip-content"
leverage_input = "#leverage-input"
tab_positions = "tab-positions"
margin_row = '[col-id="margin"]'


def create_position(vega: VegaServiceNull, market_id):
    submit_order(vega, "Key 1", market_id, "SIDE_SELL", 100, 110)
    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 100, 110)
    vega.wait_fn(1)
    vega.wait_for_total_catchup


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_isolated_margin(
        continuous_market, vega: VegaServiceNull, page: Page):
    create_position(vega, continuous_market)
    page.goto(f"/#/markets/{continuous_market}")
    expect(page.locator(margin_row).nth(1)
           ).to_have_text("874.21992Cross1.0x")
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    page.get_by_test_id(tab_positions).get_by_text("Cross").hover()
    expect(page.get_by_test_id(tooltip_content).nth(0)).to_have_text(
        "Liquidation: 582.81328Margin: 874.21992General account: 998,084.95183"
    )
    page.get_by_role("button", name="Isolated 10x").click()
    page.locator(leverage_input).clear()
    page.locator(leverage_input).type("1")
    page.get_by_role("button", name="Confirm").click()
    wait_for_toast_confirmation(page)
    next_epoch(vega=vega)
    expect(page.get_by_test_id("toast-content")).to_have_text(
        "ConfirmedYour transaction has been confirmedView in block explorerUpdate margin modeBTC:DAI_2023Isolated margin mode, leverage: 1.0x")
    expect(page.locator(margin_row).nth(1)
           ).to_have_text("11,109.99996Isolated1.0x")
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    page.get_by_test_id(tab_positions).get_by_text("Isolated").hover()
    expect(page.get_by_test_id(tooltip_content).nth(0)).to_have_text(
        "Liquidation: 583.62409Margin: 11,109.99996Order: 11,000.00"
    )
