import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from fixtures.market import (
    setup_continuous_market,
)


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_closed_market_position(vega: VegaServiceNull, page: Page):
    market_id = setup_continuous_market(vega)

    vega.submit_termination_and_settlement_data(
        settlement_key="FJMKnwfZdd48C8NqvYrG",
        settlement_price=110,
        market_id=market_id,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.goto(f"/#/markets/{market_id}")
    expect(page.locator(".ag-overlay-panel")).to_have_text("No positions")
    page.locator("label").filter(has_text="Show closed positions").click()
    tab = page.get_by_test_id("tab-positions")
    table = tab.locator('[class="ag-body ag-layout-normal"]')
    market = table.locator("[col-id='marketCode']")
    expect(market.get_by_test_id("stack-cell-primary")
           ).to_have_text("BTC:DAI_2023")
    page.locator("label").filter(has_text="Show closed positions").click()
    expect(page.locator(".ag-overlay-panel")).to_have_text("No positions")
