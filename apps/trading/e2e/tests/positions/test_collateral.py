import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from conftest import init_vega
from fixtures.market import setup_continuous_market

TOOLTIP_LABEL = "margin-health-tooltip-label"
TOOLTIP_VALUE = "margin-health-tooltip-value"
COL_ID_USED = ".ag-center-cols-container [col-id='used'] .ag-cell-value"

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega

@pytest.fixture(scope="module")
def continuous_market(vega: VegaService):
    return setup_continuous_market(vega)

@pytest.mark.usefixtures("auth", "risk_accepted")
def test_usage_breakdown(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id("Collateral").click()
    page.locator(".ag-floating-top-container .ag-row [col-id='used']").click()
    usage_breakdown = page.get_by_test_id('usage-breakdown')

    # Verify headers
    headers = ['Market', 'Account type', 'Balance', 'Margin health']
    ag_headers = usage_breakdown.locator('.ag-header-cell-text').element_handles()
    for i, header_element in enumerate(ag_headers):
        header_text = header_element.text_content()
        assert header_text == headers[i]

    # Other expectations
    expect(usage_breakdown.locator('[class="mb-2 text-sm"]')).to_have_text("You have 1,000,000.00 tDAI in total.")
    expect(usage_breakdown.locator(COL_ID_USED).first).to_have_text("8.50269 (0%)")
    expect(usage_breakdown.locator(COL_ID_USED).nth(1)).to_have_text("999,991.49731 (99%)")

    # Maintenance Level
    expect(usage_breakdown.locator(".ag-center-cols-container [col-id='market.id'] .ag-cell-value").first).to_have_text("2.85556 above maintenance level")

    # Margin health tooltip
    usage_breakdown.get_by_test_id("margin-health-chart-track").hover()
    tooltip_data = [("maintenance level", "5.64713"), ("search level", "6.21184"), ("initial level", "8.47069"), ("balance", "8.50269"), ("release level", "9.60012")]

    for index, (label, value) in enumerate(tooltip_data):
        expect(page.get_by_test_id(TOOLTIP_LABEL).nth(index)).to_have_text(label)
        expect(page.get_by_test_id(TOOLTIP_VALUE).nth(index)).to_have_text(value)


    page.get_by_test_id('dialog-close').click()
