import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from conftest import init_vega
from fixtures.market import setup_continuous_market
from actions.utils import next_epoch, truncate_middle


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
        "Active"
    )
    # 5002-LIQP-006
    expect(page.get_by_test_id("target-stake")).to_have_text("Target stake5.82757 tDAI")
    # 5002-LIQP-007
    expect(page.get_by_test_id("supplied-stake")).to_have_text("Supplied stake10,000.00 tDAI")
    # 5002-LIQP-008
    expect(page.get_by_test_id("liquidity-supplied")).to_have_text("Liquidity supplied 171,598.11%")
    expect(page.get_by_test_id("fees-paid")).to_have_text("Fees paid-")
    # 5002-LIQP-009
    expect(page.get_by_test_id("liquidity-market-id")).to_have_text("Market ID" + truncate_middle(continuous_market))
    expect(page.get_by_test_id("liquidity-learn-more")).to_have_text("Learn moreProviding liquidity")
    # 002-LIQP-010
    expect(page.get_by_test_id("liquidity-learn-more").get_by_test_id("external-link")).to_have_attribute("href", "https://docs.vega.xyz/testnet/concepts/liquidity/provision")

    vega.submit_simple_liquidity(
        key_name="mm",
        market_id=continuous_market,
        commitment_amount=1,
        fee=0.001,
        is_amendment=True,
    )

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.reload()
    row = page.get_by_test_id("tab-myLP").locator(".ag-center-cols-container .ag-row").first
    expect(row).to_contain_text(
        "Updating next epoch"
    )
    next_epoch(vega=vega)
    page.reload()
    expect(page.get_by_test_id("supplied-stake")).to_have_text("Supplied stake1.00001 tDAI")
    expect(page.get_by_test_id("liquidity-supplied")).to_have_text("Liquidity supplied 17.16%")
    row = page.get_by_test_id("tab-myLP").locator(".ag-center-cols-container .ag-row").first
    expect(row).to_contain_text(
        "Active"
    )
@pytest.mark.skip("Waiting for the ability to cancel LP")
@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_liquidity_provision_inactive(continuous_market, vega: VegaService, page: Page):
    # TODO Refactor asserting the grid
    page.goto(f"/#/liquidity/{continuous_market}")
    page.get_by_test_id("manage-vega-wallet").click()
    #TODO Rename "mm" to "marketMaker" so that we don't have to specify where to click when switching wallets
    # Currently the default click will click the middle of the element which will click the copy wallet key button
    page.locator('[role="menuitemradio"] >> .mr-2.uppercase').nth(1).click(position={ "x": 0, "y": 0}, force=True)
    page.reload()
    row = page.get_by_test_id("tab-myLP").locator(".ag-center-cols-container .ag-row").first
    expect(row).to_contain_text(
        "Active"
    )
    vega.submit_simple_liquidity(
        key_name="mm",
        market_id=continuous_market,
        commitment_amount=0,
        fee=0,
        is_amendment=False,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    
    page.reload()
    expect()