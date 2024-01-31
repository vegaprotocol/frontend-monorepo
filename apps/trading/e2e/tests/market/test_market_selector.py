import pytest
from playwright.sync_api import expect, Page


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_market_selector(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    expect(page.get_by_test_id("market-selector")).not_to_be_visible()
    page.get_by_test_id("header-title").click()
    # 6001-MARK-066
    expect(page.get_by_test_id("market-selector")).to_be_visible()
    # 6001-MARK-021
    # 6001-MARK-022
    # 6001-MARK-024
    # 6001-MARK-025
    btc_market = page.locator('[data-testid="market-selector-list"] a')
    expect(btc_market.locator("h3")).to_have_text("BTC:DAI_2023Futr")
    # tbd - 5465
    # expect(btc_market.locator('[data-testid="market-selector-volume"]')).to_have_text(
    #     "1"
    # )
    expect(btc_market.locator('[data-testid="market-selector-price"]')).to_have_text(
        "107.50 tDAI"
    )
    expect(btc_market.locator("span.rounded-md.leading-none")).to_be_visible()
    expect(btc_market.locator("span.rounded-md.leading-none")).to_have_text("Futr")
    expect(btc_market.locator('[data-testid="sparkline-svg"]')).not_to_be_visible
