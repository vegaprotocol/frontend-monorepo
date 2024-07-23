from typing import Generator, Tuple
import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from fixtures.market import setup_spot_market
from conftest import init_page, init_vega, risk_accepted_setup, cleanup_container, auth_setup
from actions.utils import wait_for_toast_confirmation

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance


@pytest.fixture(scope="module")
def setup_environment(vega, browser, request) -> Generator[Tuple[Page, VegaServiceNull], None, None]:
    with init_page(vega, browser, request) as page:
        setup_spot_market(vega)
        risk_accepted_setup(page)
        auth_setup(vega, page)
        page.goto("#/portfolio")
        page.get_by_test_id("expand-account-card").first.click()
        page.get_by_test_id("account-action-swap").click()
        yield page, vega


def test_swap(setup_environment: Tuple[Page, VegaServiceNull]):
    page, vega = setup_environment
    page.get_by_test_id("you-pay-dropdown-trigger").click()
    page.get_by_role("menuitem", name="USDT").click()
    #This is required to close the drop down
    page.get_by_test_id("Deposits").click(force=True)

    page.get_by_test_id("you-receive-dropdown-trigger").click()
    page.get_by_role("menuitem", name="BTC").click()

    #This is required to close the drop down
    page.get_by_test_id("Deposits").click(force=True)
    page.get_by_test_id("you-pay-amount-input").fill("1")
    page.get_by_test_id("swap-now-button").click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(page.get_by_test_id("toast-content")).to_contain_text(
        "Order filledYour transaction has been confirmed.View on explorer"
    )
