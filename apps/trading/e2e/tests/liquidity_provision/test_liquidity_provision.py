import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from conftest import init_vega
from fixtures.market import setup_continuous_market
from actions.utils import next_epoch

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega


@pytest.fixture(scope="module")
def continuous_market(vega):
    return setup_continuous_market(vega)


@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_liquidity_provision_amendment(continuous_market, vega: VegaService, page: Page):
    # TODO Refactor asserting the grid
    page.goto(f"/#/liquidity/{continuous_market}")
    page.get_by_test_id("manage-vega-wallet").click()
    #TODO Rename "mm" to "marketMaker" so that we don't have to specify where to click when switching wallets
    # Currently the default click will click the middle of the element which will click the copy wallet key button
    page.locator('[role="menuitemradio"] >> .mr-2.uppercase').nth(1).click(position={ "x": 0, "y": 0}, force=True)
    page.reload()
    row = page.get_by_test_id("tab-myLP").locator(".ag-center-cols-container .ag-row").first
    expect(row).to_contain_text(
        "10,000.0010,000.000.00%10,000.00100.00%10,000.00-100.00%0.00%---Active"
    )
    vega.submit_simple_liquidity(
        key_name="mm",
        market_id=continuous_market,
        commitment_amount=100,
        fee=0.001,
        is_amendment=True,
    )

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.reload()
    row = page.get_by_test_id("tab-myLP").locator(".ag-center-cols-container .ag-row").first
    expect(row).to_contain_text(
        "10,000.00/100.00100.000.00%/0.10%10,000.00100.00%10,000.00-100.00%100.00%---Updating next epoch5/9/2023"
    )
    next_epoch(vega=vega)
    page.reload()
    row = page.get_by_test_id("tab-myLP").locator(".ag-center-cols-container .ag-row").first
    expect(row).to_contain_text(
        "100.00100.000.10%100.00100.00%100.00-100.00%0.00%100.00%0.00%0.00%Active"
    )