import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from conftest import init_vega
from fixtures.market import setup_continuous_market
from actions.utils import next_epoch, truncate_middle, change_keys


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega


@pytest.fixture(scope="module")
def continuous_market(vega):
    return setup_continuous_market(vega)

@pytest.mark.skip("Issue 5581")
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_liquidity_provision_amendment(continuous_market, vega: VegaServiceNull, page: Page):
    # TODO Refactor asserting the grid
    page.goto(f"/#/liquidity/{continuous_market}")
    change_keys(page, vega, "market_maker")
    row = page.get_by_test_id(
        "tab-myLP").locator(".ag-center-cols-container .ag-row").first
    expect(row).to_contain_text(
        "Active"
    )
    # 5002-LIQP-006
    expect(page.get_by_test_id("target-stake")
           ).to_have_text("Target stake5.82757 tDAI")
    # 5002-LIQP-007
    expect(page.get_by_test_id("supplied-stake")
           ).to_have_text("Supplied stake10,000.00 tDAI")
    # 5002-LIQP-008
    expect(page.get_by_test_id("liquidity-supplied")
           ).to_have_text("Liquidity supplied 171,598.11%")
    expect(page.get_by_test_id("fees-paid")).to_have_text("Fees paid-")
    # 5002-LIQP-009
    expect(page.get_by_test_id("liquidity-market-id")
           ).to_have_text("Market ID" + truncate_middle(continuous_market))
    expect(page.get_by_test_id("liquidity-learn-more")
           ).to_have_text("Learn moreProviding liquidity")
    # 002-LIQP-010
    expect(page.get_by_test_id("liquidity-learn-more").get_by_test_id("external-link")
           ).to_have_attribute("href", "https://docs.vega.xyz/testnet/concepts/liquidity/provision")

    vega.submit_simple_liquidity(
        key_name="market_maker",
        market_id=continuous_market,
        commitment_amount=1,
        fee=0.001,
        is_amendment=True,
    )

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    page.reload()
    row = page.get_by_test_id(
        "tab-myLP").locator(".ag-center-cols-container .ag-row").first
    expect(row).to_contain_text(
        "Updating next epoch"
    )
    next_epoch(vega=vega)
    page.reload()
    expect(page.get_by_test_id("supplied-stake")
           ).to_have_text("Supplied stake1.00001 tDAI")
    expect(page.get_by_test_id("liquidity-supplied")
           ).to_have_text("Liquidity supplied 17.16%")
    row = page.get_by_test_id(
        "tab-myLP").locator(".ag-center-cols-container .ag-row").first
    expect(row).to_contain_text(
        "Active"
    )


@pytest.mark.skip("Waiting for the ability to cancel LP")
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_liquidity_provision_inactive(continuous_market, vega: VegaServiceNull, page: Page):
    # TODO Refactor asserting the grid
    page.goto(f"/#/liquidity/{continuous_market}")
    change_keys(page, vega, "market_maker")
    row = page.get_by_test_id(
        "tab-myLP").locator(".ag-center-cols-container .ag-row").first
    expect(row).to_contain_text(
        "Active"
    )
    vega.submit_simple_liquidity(
        key_name="market_maker",
        market_id=continuous_market,
        commitment_amount=0,
        fee=0,
        is_amendment=False,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
