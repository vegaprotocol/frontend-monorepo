import pytest
from playwright.sync_api import expect, Page

settings_icon = "icon-cog"
settings_column_btn = "popover-trigger"
settings_close_btn = "settings-close"
split_view_view = "split-view-view"

@pytest.mark.usefixtures("page", "continuous_market", "auth", "risk_accepted")
def test_column_settings_is_visible(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    expect(page.get_by_test_id(split_view_view).get_by_test_id(settings_column_btn)).to_be_visible()
    page.goto("/#/portfolio")
    expect(page.get_by_test_id(split_view_view).get_by_test_id(settings_column_btn).nth(0)).to_be_visible()
    expect(page.get_by_test_id(split_view_view).get_by_test_id(settings_column_btn).nth(1)).to_be_visible()
    page.goto(f"/#/markets/all")
    expect(page.get_by_test_id(settings_column_btn)).to_be_visible()
    page.click('[data-testid="Proposed markets"]')
    expect(page.get_by_test_id(settings_column_btn)).to_be_visible()
    page.click('[data-testid="Closed markets"]')
    expect(page.get_by_test_id(settings_column_btn)).to_be_visible()

@pytest.mark.usefixtures("page", "continuous_market", "auth", "risk_accepted")
def test_can_reset_columns_state(continuous_market, page: Page):
    page.goto(f"/#/markets/all")
    col_market = page.locator('[data-testid="market-code"]').first
    col_settlement_asset = page.locator('[col-id="tradableInstrument.instrument.product.settlementAsset.symbol"]').first
    col_market.drag_to(col_settlement_asset)

    # Check the attribute of the dragged element
    attribute_value = col_market.get_attribute("aria-colindex")
    assert attribute_value != "1"
    page.get_by_test_id(settings_column_btn).click()
    page.get_by_role("button", name="Reset Columns").click()
    attribute_value_after_reset = col_market.get_attribute("aria-colindex")
    assert attribute_value_after_reset  == "1"