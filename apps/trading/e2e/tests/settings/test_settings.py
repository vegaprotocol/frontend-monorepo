import pytest
from playwright.sync_api import expect, Page
from conftest import init_vega, cleanup_container


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance


# Define a mapping of icon selectors to toast selectors
ICON_TO_TOAST = {
    'aria-label="arrow-top-left icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
    'aria-label="arrow-up icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
    'aria-label="arrow-top-right icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
    'aria-label="arrow-bottom-left icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
    'aria-label="arrow-down icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
    'aria-label="arrow-bottom-right icon"': 'class="relative flex-1 overflow-auto p-4 pr-[40px] [&>p]:mb-[2.5px]"',
}


@pytest.mark.usefixtures("risk_accepted")
def test_toast_positions(page: Page):
    page.goto("/")
    page.get_by_test_id("Settings").click()
    for icon_selector, toast_selector in ICON_TO_TOAST.items():
        # Click the icon
        page.click(f"[{icon_selector}]")
        # Expect that the toast is displayed
        expect(page.locator(f"[{toast_selector}]")).to_be_visible()


@pytest.mark.usefixtures("risk_accepted")
def test_dark_mode(page: Page):
    page.goto("/")
    page.get_by_test_id("Settings").click()
    expect(page.locator("html")).not_to_have_attribute("class", "dark")
    page.locator("#switch-settings-theme-switch").click()
    expect(page.locator("html")).to_have_attribute("class", "dark")
