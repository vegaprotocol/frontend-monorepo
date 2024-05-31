import re
from typing import Generator, Tuple
import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from fixtures.market import setup_spot_market
from conftest import init_page, init_vega, risk_accepted_setup, cleanup_container, auth_setup

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
        page.get_by_test_id("Swap").click()
        yield page, vega 




@pytest.mark.skip("WIP")
def test_swap(setup_environment: Tuple[Page, VegaServiceNull]):
    page, vega = setup_environment  
    page.pause()
    page.get_by_test_id("icon-chevron-down").first.click()
    page.get_by_role("menuitem", name="USDT").click()
    page.get_by_test_id("icon-chevron-down").nth(1).click()
    page.get_by_role("menuitem", name="BTC").click()
    page.pause()  
    vega.wait_fn(1)  
    vega.wait_for_total_catchup()  
    page.pause() 
    expect(page).to_have_text("Expected text on the page")