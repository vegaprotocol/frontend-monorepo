import pytest
from playwright.sync_api import expect, Page
from conftest import init_vega


@pytest.fixture(scope="module")
def vega():
    with init_vega() as vega:
        yield vega


@pytest.mark.usefixtures("page", "risk_accepted")
def test_share_usage_data(page: Page):
    page.goto("/")
   # page.get_by_test_id("icon-cross").click()
    page.get_by_test_id("Settings").click()
    telemetry_switch = page.locator("#switch-settings-telemetry-switch")
    expect(telemetry_switch).to_have_attribute("data-state", "unchecked")

    telemetry_switch.click()
    expect(telemetry_switch).to_have_attribute("data-state", "checked")
    page.reload()
    page.get_by_test_id("Settings").click()
    expect(telemetry_switch).to_have_attribute("data-state", "unchecked")

    telemetry_switch.click()
    expect(telemetry_switch).to_have_attribute("data-state", "checked")
    page.reload()
    page.get_by_test_id("Settings").click()
    expect(telemetry_switch).to_have_attribute("data-state", "unchecked")


# Define a mapping of icon selectors to toast selectors
ICON_TO_TOAST = {
    'aria-label="arrow-top-left icon"': 'class="group absolute z-20 top-0 left-0 max-w-full max-h-full overflow-x-hidden overflow-y-auto p-4"',
    'aria-label="arrow-up icon"': 'class="group absolute z-20 top-0 left-[50%] translate-x-[-50%] max-w-full max-h-full overflow-x-hidden overflow-y-auto p-4"',
    'aria-label="arrow-top-right icon"': 'class="group absolute z-20 top-0 right-0 max-w-full max-h-full overflow-x-hidden overflow-y-auto p-4"',
    'aria-label="arrow-bottom-left icon"': 'class="group absolute z-20 bottom-0 left-0 max-w-full max-h-full overflow-x-hidden overflow-y-auto p-4"',
    'aria-label="arrow-down icon"': 'class="group absolute z-20 bottom-0 left-[50%] translate-x-[-50%] max-w-full max-h-full overflow-x-hidden overflow-y-auto p-4"',
    'aria-label="arrow-bottom-right icon"': 'class="group absolute z-20 bottom-0 right-0 max-w-full max-h-full overflow-x-hidden overflow-y-auto p-4"',
}


@pytest.mark.usefixtures("page", "risk_accepted")
def test_toast_positions(page: Page):
    page.goto("/")
    page.get_by_test_id("Settings").click()
    for icon_selector, toast_selector in ICON_TO_TOAST.items():
        # Click the icon
        page.click(f"[{icon_selector}]")
        # Expect that the toast is displayed
        expect(page.locator(f"[{toast_selector}]")).to_be_visible()


@pytest.mark.usefixtures("page", "risk_accepted")
def test_dark_mode(page: Page):
    page.goto("/")
    page.get_by_test_id("Settings").click()
    expect(page.locator("html")).not_to_have_attribute("class", "dark")
    page.locator("#switch-settings-theme-switch").click()
    expect(page.locator("html")).to_have_attribute("class", "dark")
