import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService

from conftest import init_page, init_vega, risk_accepted_setup


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega


@pytest.fixture(scope="module")
def page(vega, browser, request, port):
    with init_page(vega, browser, request, port) as page:
        risk_accepted_setup(page)
        page.goto("/#/markets/all")
        yield page


def test_no_open_markets(page: Page):
    # 6001-MARK-034
    page.get_by_test_id("Open markets").click()
    expect(page.locator(".ag-overlay-wrapper")).to_have_text("No markets")


def test_no_closed_markets(page: Page):
    page.get_by_test_id("Closed markets").click()
    expect(page.locator(".ag-overlay-wrapper")).to_have_text("No markets")


def test_no_proposed_markets(page: Page):
    # 6001-MARK-061
    page.get_by_test_id("Proposed markets").click()
    expect(page.locator(".ag-overlay-wrapper")).to_have_text("No proposed markets")
