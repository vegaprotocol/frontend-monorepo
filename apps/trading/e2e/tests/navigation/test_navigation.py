import pytest
from playwright.sync_api import Page, expect, Locator

from conftest import init_page, init_vega


@pytest.fixture(scope="module")
def vega(local_server):
    with init_vega(local_server) as vega:
        yield vega


# we can reuse single page instance in all tests
@pytest.fixture(scope="module")
def page(vega, browser, request, local_server):
    with init_page(vega, browser, request, local_server) as page:
        yield page


@pytest.mark.usefixtures("risk_accepted")
def test_network_switcher(page: Page):
    page.goto("/#/disclaimer")
    navbar = page.locator('nav[aria-label="Main"]')
    assert_network_switcher(navbar)


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
    assert_network_switcher(menu)
    menu.get_by_role("button", name="Close menu").click()
    # endregion

    # region wallet
    wallet_button = navbar.get_by_test_id("navbar-mobile-wallet")
    expect(wallet_button).to_be_visible()
    wallet_button.click()
    dialog = page.get_by_test_id("dialog-content")
    expect(dialog.get_by_test_id("wallet-dialog-title")).to_be_visible()
    # endregion


def assert_links(container: Locator):
    pages = [
        {"name": "Markets", "href": "#/markets"},
        {"name": "Trading", "href": "#/markets/"},
        {"name": "Portfolio", "href": "#/portfolio"},
    ]

    for page in pages:
        link = container.get_by_role("link", name=page["name"])
        expect(link).to_be_visible()
        expect(link).to_have_attribute("href", page["href"])

    # False indicates external link configured by env var
    resource_pages = [
        {"name": "Docs", "href": False},
        {"name": "Give Feedback", "href": False},
        {"name": "Disclaimer", "href": "#/disclaimer"},
    ]

    container.get_by_role("button", name="Resources").click()

    dropdown = container.get_by_test_id("navbar-content-resources")

    for resource_page in resource_pages:
        page_name = resource_page["name"]
        page_href = resource_page["href"]
        link = dropdown.get_by_role("link", name=page_name)
        expect(link).to_be_visible()
        if not page_href:
            href = link.get_attribute("href")
            expect(link).to_have_attribute("target", "_blank")
            assert len(href) >= 0, f"href for {page_name} is empty"
        else:
            expect(link).to_have_attribute("href", page_href)


def assert_network_switcher(container: Locator):
    network_switcher_trigger = container.get_by_test_id(
        "navbar-network-switcher-trigger"
    )
    # 0006-NETW-002
    expect(network_switcher_trigger).to_have_text = "Fairground testnet"
    network_switcher_trigger.click()
    dropdown = container.get_by_test_id("navbar-content-network-switcher")
    expect(dropdown).to_be_visible()
    links = dropdown.get_by_role("link")
    expect(links).to_have_count(2)
    mainnet_link = container.get_by_role("link", name="Mainnet")
    expect(mainnet_link).to_be_visible()
    # 0006-NETW-003
    expect(mainnet_link).to_have_attribute("href", "https://console.vega.xyz")
    expect(container.get_by_role("link", name="Fairground testnet")).to_be_visible()
