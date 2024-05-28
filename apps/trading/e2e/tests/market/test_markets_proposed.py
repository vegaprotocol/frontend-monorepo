import pytest
import vega_sim.api.governance as governance
import re
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from conftest import init_vega, cleanup_container
from fixtures.market import setup_simple_market
from wallet_config import MM_WALLET

row_selector = '[data-testid="tab-proposed-markets"] .ag-center-cols-container .ag-row'
col_market_id = '[col-id="market"] [data-testid="stack-cell-primary"]'


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance



@pytest.fixture(scope="module")
def proposed_market(vega: VegaServiceNull):
    # setup market without liquidity provided
    market_id = setup_simple_market(vega, approve_proposal=False)
    # approve market
    governance.approve_proposal(
        key_name=MM_WALLET.name,
        proposal_id=market_id,
        wallet=vega.wallet,
    )
    return market_id

@pytest.mark.skip("markets list page")
@pytest.mark.usefixtures("risk_accepted")
def test_can_see_table_headers(proposed_market, page: Page):
    page.goto("/#/markets/all")
    page.click('[data-testid="Proposed markets"]')

    # Test that you can see table headers
    headers = [
        "Market",
        "Settlement asset",
        "State",
        "Parent market",
        "Closing date",
        "Enactment date",
        "",
    ]

    header_elements = page.locator(".ag-header-cell-text")
    for i, header in enumerate(headers):
        assert header_elements.nth(i).inner_text() == header

@pytest.mark.skip("markets list page")
@pytest.mark.usefixtures("risk_accepted")
def test_renders_markets_correctly(proposed_market, page: Page):
    page.goto(f"/#/markets/all")
    page.click('[data-testid="Proposed markets"]')
    row = page.locator(row_selector)
    # 6001-MARK-051
    expect(row.locator('[col-id="asset"]')).to_have_text("tDAI")

    # 6001-MARK-052
    # 6001-MARK-053
    expect(row.locator('[col-id="state"]')).to_have_text("Proposed")
    expect(
        row.locator('[col-id="parentMarketID"]')
    ).to_have_text("-")

    # 6001-MARK-056
    expect(row.locator('[col-id="closing-date"]')).not_to_be_empty()

    # 6001-MARK-057
    expect(row.locator('[col-id="enactment-date"]')).not_to_be_empty

    # 6001-MARK-058
    page.get_by_test_id("dropdown-menu").click()
    dropdown_content = '[data-testid="proposal-actions-content"]'
    first_item_link = (
        page.locator(f"{dropdown_content} [role='menuitem']").nth(0).locator("a")
    )

    # 6001-MARK-059
    expect(first_item_link).to_contain_text("View proposal")
    expect(first_item_link).to_have_attribute(
        "href",
        re.compile(r"\/proposals\/[a-f0-9]{64}$"),
    )

    #6001-MARK-060
    expect(page.get_by_test_id("propose-new-market")).to_be_visible()
    propose_new_market = page.get_by_test_id("propose-new-market")
    expect(propose_new_market).to_have_attribute(
        "href",
        re.compile(r"\/proposals\/propose\/new-market"),
    )

@pytest.mark.skip("markets list page")
@pytest.mark.usefixtures("risk_accepted")
def test_can_drag_and_drop_columns(proposed_market, page: Page):
    # 6001-MARK-063
    page.goto("/#/markets/all")
    page.click('[data-testid="Proposed markets"]')
    col_market = page.locator('[col-id="market"]').first
    col_state = page.locator('[col-id="state"]').first
    col_market.drag_to(col_state)

    # Check the attribute of the dragged element
    attribute_value = col_market.get_attribute("aria-colindex")
    assert attribute_value != "1"