import pytest
from playwright.sync_api import Page, expect
from conftest import init_vega
from fixtures.market import setup_continuous_market

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega

@pytest.fixture(scope="module")
def continuous_market(vega):
    return setup_continuous_market(vega)

@pytest.mark.skip("We currently can't approve wallet connection through Sim")
@pytest.mark.usefixtures("risk_accepted")
def test_connect_vega_wallet(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id("order-price").fill("101")
    page.get_by_test_id("order-connect-wallet").click()
    expect(page.locator('[role="dialog"]')).to_be_visible()
    page.get_by_test_id("connector-jsonRpc").click()
    expect(page.get_by_test_id("wallet-dialog-title")).to_be_visible()
    # TODO: accept wallet connection and assert wallet is connected.
    expect(page.get_by_test_id("order-type-Limit")).to_be_checked()
    expect(page.get_by_test_id("order-price")).to_have_value("101")

@pytest.mark.usefixtures("risk_accepted")
def test_sidebar_should_be_open_after_reload(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    expect(page.get_by_test_id("deal-ticket-form")).to_be_visible()
    page.get_by_test_id("Order").click()
    expect(page.get_by_test_id("deal-ticket-form")).not_to_be_visible()
    page.reload()
    expect(page.get_by_test_id("deal-ticket-form")).to_be_visible()
