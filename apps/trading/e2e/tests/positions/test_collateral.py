import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from conftest import init_vega, cleanup_container
from fixtures.market import setup_continuous_market

TOOLTIP_LABEL = "margin-health-tooltip-label"
TOOLTIP_VALUE = "margin-health-tooltip-value"
COL_ID_USED = ".ag-center-cols-container [col-id='used'] .ag-cell-value"


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance



@pytest.fixture(scope="module")
def continuous_market(vega: VegaServiceNull):
    return setup_continuous_market(vega)


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_usage_breakdown(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id("Collateral").click()
    page.locator(".ag-floating-top-container .ag-row [col-id='used']").click()
    usage_breakdown = page.get_by_test_id("usage-breakdown")

    # Verify headers
    headers = ["Market", "Account type", "Balance"]
    ag_headers = usage_breakdown.locator(
        ".ag-header-cell-text").element_handles()
    for i, header_element in enumerate(ag_headers):
        header_text = header_element.text_content()
        assert header_text == headers[i]

    # Other expectations
    expect(usage_breakdown.locator('[class="mb-2 text-sm"]')).to_have_text(
        "You have 1,000,000.00 tDAI in total."
    )
    expect(usage_breakdown.locator(
        COL_ID_USED).first).to_have_text("8.50269 (0%)")
    expect(usage_breakdown.locator(COL_ID_USED).nth(1)).to_have_text(
        "999,991.49731 (99%)"
    )

    page.get_by_test_id("dialog-close").click()
