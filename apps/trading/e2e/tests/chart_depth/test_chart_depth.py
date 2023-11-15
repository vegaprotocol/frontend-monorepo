import pytest
from playwright.sync_api import expect, Page

@pytest.mark.usefixtures("page", "continuous_market", "risk_accepted")
def test_see_market_depth_chart(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    # Click on the 'Depth' tab
    page.get_by_test_id("Depth").click()
    # Check if the 'Depth' tab and the depth chart are visible
    # 6006-DEPC-001
    expect(page.get_by_test_id("tab-depth")).to_be_visible()
    expect(page.locator('[class^="depth-chart-module_canvas__"]').first).to_be_visible()
