import pytest
from playwright.sync_api import Page, expect, Locator

from conftest import init_page, init_vega, cleanup_container


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance


@pytest.fixture(scope="module")
def page(vega, browser, request):
    with init_page(vega, browser, request) as page:
        yield page

@pytest.mark.usefixtures("risk_accepted")
def test_navbar_pages(page: Page):
    page.goto("/#/disclaimer")
    navbar = page.locator('nav[aria-label="Main"]')
    assert_links(navbar)


@pytest.mark.usefixtures("risk_accepted")
def test_navigation_mobile(page: Page):
    page.goto("/#/disclaimer")
    page.set_viewport_size({"width": 800, "height": 1040})
    navbar = page.locator('nav[aria-label="Main"]')

    # region navigation
    burger = navbar.get_by_test_id("navbar-mobile-burger")
    expect(burger).to_be_visible()
    burger.click()
    menu = navbar.get_by_test_id("navbar-menu-content")
    expect(menu).to_be_visible()
    assert_links(menu)
    menu.get_by_role("button", name="Close menu").click()
    # endregion

    # region wallet
    wallet_button = navbar.get_by_test_id("navbar-mobile-wallet")
    expect(wallet_button).to_be_visible()
    wallet_button.click()

    expect(page.get_by_test_id("dialog-content").nth(1)).to_be_visible()
    # endregion


def assert_links(container: Locator):
    pages = [
        {"name": "Trading", "href": "#/markets/"},
        {"name": "Portfolio", "href": "#/portfolio"},
        {"name": "Competitions", "href": "#/competitions"},
    ]

    for page in pages:
        link = container.get_by_role("link", name=page["name"])
        expect(link).to_be_visible()
        expect(link).to_have_attribute("href", page["href"])

    # False indicates external link configured by env var
    more_pages = [
        {"name": "Markets", "href": "#/markets"},
        {"name": "Fees", "href": "#/fees"},
        {"name": "Rewards", "href": "#/rewards"},
        {"name": "Referrals", "href": "#/referrals"},
        {"name": "Docs", "href": False},
        {"name": "Governance", "href": False},
        {"name": "Explorer", "href": False},
        {"name": "Docs", "href": False},
        {"name": "Disclaimer", "href": "#/disclaimer"},
    ]

    container.get_by_role("button", name="Resources").click()

    dropdown = container.get_by_test_id("navbar-content-resources")

    for more_page in more_pages:
        page_name = more_page["name"]
        page_href = more_page["href"]
        link = dropdown.get_by_role("link", name=page_name)
        expect(link).to_be_visible()
        if not page_href:
            href = link.get_attribute("href")
            expect(link).to_have_attribute("target", "_blank")
            assert len(href) >= 0, f"href for {page_name} is empty"
        else:
            expect(link).to_have_attribute("href", page_href)

