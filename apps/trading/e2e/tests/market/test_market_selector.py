import pytest
from playwright.sync_api import expect, Page


@pytest.mark.usefixtures("page", "continuous_market", "auth", "risk_accepted")
def test_market_selector(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.pause()
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
    expect(btc_market.locator('[data-testid="market-selector-volume"]')).to_have_text(
        "0.00"
    )
    expect(btc_market.locator('[data-testid="market-selector-price"]')).to_have_text(
        "107.50 tDAI"
    )
    expect(btc_market.locator("span.rounded-md.leading-none")).to_be_visible()
    expect(btc_market.locator("span.rounded-md.leading-none")).to_have_text("Futr")
    expect(btc_market.locator('[data-testid="sparkline-svg"]')).not_to_be_visible


@pytest.mark.usefixtures("page", "continuous_market", "simple_market", "auth", "risk_accepted")
@pytest.mark.parametrize(
    "simple_market",
    [
        {
            "custom_market_name": "APPL.MF21",
            "custom_asset_name": "tUSDC",
            "custom_asset_symbol": "tUSDC",
        }
    ],
    indirect=True,
)
def test_market_selector_filter(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id("header-title").click()
    # 6001-MARK-027

    page.get_by_test_id("product-Spot").click()
    expect(page.get_by_test_id("market-selector-list")).to_contain_text(
        "Spot markets coming soon."
    )
    page.get_by_test_id("product-Perpetual").click()
    expect(page.get_by_test_id("market-selector-list")).to_contain_text(
        "No perpetual markets."
    )
    page.get_by_test_id("product-Future").click()
    expect(page.locator('[data-testid="market-selector-list"] a')).to_have_count(2)

    # 6001-MARK-029
    page.get_by_test_id("search-term").fill("btc")
    expect(page.locator('[data-testid="market-selector-list"] a')).to_have_count(1)
    expect(page.locator('[data-testid="market-selector-list"] a').nth(0)).to_have_text(
        "BTC:DAI_2023107.50 tDAI1"
    )

    page.get_by_test_id("search-term").clear()
    expect(page.locator('[data-testid="market-selector-list"] a')).to_have_count(2)

    # 6001-MARK-030
    # 6001-MARK-031
    # 6001-MARK-032
    # 6001-MARK-033
    page.get_by_test_id("sort-trigger").click()

    expect(page.get_by_test_id("sort-item-Gained")).to_have_text("Top gaining")
    expect(page.get_by_test_id("sort-item-Gained")).to_be_visible()
    expect(page.get_by_test_id("sort-item-Lost")).to_have_text("Top losing")
    expect(page.get_by_test_id("sort-item-Lost")).to_be_visible()
    expect(page.get_by_test_id("sort-item-New")).to_have_text("New markets")
    expect(page.get_by_test_id("sort-item-New")).to_be_visible()

    # 6001-MARK-028
    page.get_by_test_id("sort-trigger").click(force=True)
    page.get_by_test_id("asset-trigger").click()
    page.get_by_role("menuitemcheckbox").nth(0).get_by_text("tDAI").click()
    expect(page.locator('[data-testid="market-selector-list"] a')).to_have_count(1)
    expect(page.locator('[data-testid="market-selector-list"] a').nth(0)).to_have_text(
        "BTC:DAI_2023107.50 tDAI1"
    )
