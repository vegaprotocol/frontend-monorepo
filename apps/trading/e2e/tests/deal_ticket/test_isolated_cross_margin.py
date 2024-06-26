import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from actions.utils import next_epoch, wait_for_toast_confirmation

tooltip_content = "tooltip-content"
leverage_input = "#leverage-input"
tab_positions = "tab-positions"
margin_row = '[col-id="margin"]'

current_margin = "deal-ticket-fee-current-margin"
available_collateral = "deal-ticket-fee-available-collateral"
additional_margin_required = "deal-ticket-fee-additional-margin-required"
liquidation_estimate = "deal-ticket-fee-liquidation-estimate"
dialog_content = "dialog-content"
cross_margin = "cross-margin"
isolated_margin = "isolated-margin"
confirm_cross_margin_mode = "confirm-cross-margin-mode"
confirm_isolated_margin_mode = "confirm-isolated-margin-mode"


def create_position(vega: VegaServiceNull, market_id):
    submit_order(vega, "Key 1", market_id, "SIDE_SELL", 100, 110)
    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 100, 110)
    vega.wait_fn(1)
    vega.wait_for_total_catchup


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_switch_cross_isolated_margin(
    continuous_market, vega: VegaServiceNull, page: Page
):
    create_position(vega, continuous_market)
    page.goto(f"/#/markets/{continuous_market}")
    expect(page.locator(margin_row).nth(1)).to_have_text("874.21992Cross1.0x")
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    page.get_by_test_id(tab_positions).get_by_text("Cross").hover()
    expect(page.get_by_test_id(tooltip_content).nth(0)).to_have_text(
        "Liquidation: 582.81328Margin: 874.21992General account: 998,084.95183"
    )
    page.get_by_test_id(isolated_margin).click()
    page.locator(leverage_input).fill("1")
    page.get_by_test_id(confirm_isolated_margin_mode).click()
    wait_for_toast_confirmation(page)
    next_epoch(vega=vega)
    expect(page.get_by_test_id("toast-content")).to_have_text(
        "ConfirmedYour transaction has been confirmed.View on explorerUpdate margin modeBTC:DAI_2023Isolated margin mode, leverage: 1.0x"
    )
    expect(page.locator(margin_row).nth(1)).to_have_text("22,109.99996Isolated1.0x")
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    page.get_by_test_id(tab_positions).get_by_text("Isolated").hover()
    expect(page.get_by_test_id(tooltip_content).nth(0)).to_have_text(
        "Liquidation: 583.62409Margin: 11,109.99996Order: 11,000.00"
    )
    page.get_by_test_id(cross_margin).click()
    page.get_by_test_id(confirm_cross_margin_mode).click()
    wait_for_toast_confirmation(page)
    next_epoch(vega=vega)
    expect(page.locator(margin_row).nth(1)).to_have_text("22,109.99996Cross1.0x")


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_check_cross_isolated_margin_info(
    continuous_market, vega: VegaServiceNull, page: Page
):
    create_position(vega, continuous_market)
    page.goto(f"/#/markets/{continuous_market}")
    expect(page.get_by_test_id(current_margin)).to_have_text(
        "Current margin874.21992 tDAI"
    )
    expect(page.get_by_test_id(available_collateral)).to_have_text(
        "Available collateral998,084.95183 tDAI"
    )
    expect(page.get_by_test_id(additional_margin_required)).to_have_text(
        "Additional margin required0.00 tDAI"
    )
    expect(page.get_by_test_id(liquidation_estimate)).to_have_text(
        "Liquidation estimate- BTC"
    )
    page.get_by_test_id(isolated_margin).click()
    page.locator(leverage_input).fill("6")
    #comment because of different data develop and mainnet
    # expect(page.get_by_test_id(dialog_content).get_by_test_id("notification")).to_have_text(
    #     "You have an existing position and open order on this market.Changing the margin mode and leverage will move 869.78007 tDAI from your general account to fund the position.")
    expect(page.get_by_test_id(dialog_content).get_by_test_id(current_margin)).to_have_text(
        "Current margin874.21992 tDAI")
    expect(page.get_by_test_id(dialog_content).get_by_test_id(available_collateral)
           ).to_have_text("Available collateral998,084.95183 tDAI")
    #comment because of different data develop and mainnet
    # expect(page.get_by_test_id(dialog_content).get_by_test_id(additional_margin_required)
    #        ).to_have_text("Additional margin required869.78007 tDAI")
    expect(page.get_by_test_id(dialog_content).get_by_test_id(liquidation_estimate)
           ).to_have_text("Liquidation estimate95.23553 BTC")
    page.get_by_test_id(confirm_isolated_margin_mode).click()
    wait_for_toast_confirmation(page)
    next_epoch(vega=vega)
    expect(page.get_by_test_id("toast-content")).to_have_text(
        "ConfirmedYour transaction has been confirmed.View on explorerUpdate margin modeBTC:DAI_2023Isolated margin mode, leverage: 6.0x"
    )
    page.get_by_test_id(cross_margin).click()
    expect(
        page.get_by_test_id(dialog_content).get_by_test_id(current_margin)
    ).to_have_text("Current margin4,223.33332 tDAI")
    expect(
        page.get_by_test_id(dialog_content).get_by_test_id(available_collateral)
    ).to_have_text("Available collateral995,381.83843 tDAI")
    expect(
        page.get_by_test_id(dialog_content).get_by_test_id(additional_margin_required)
    ).to_have_text("Additional margin required-3,364.56219 tDAI")
    expect(
        page.get_by_test_id(dialog_content).get_by_test_id(liquidation_estimate)
    ).to_have_text("Liquidation estimate0.00 BTC")
