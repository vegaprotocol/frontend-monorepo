import pytest
from playwright.sync_api import Page, expect
from fixtures.market import setup_continuous_market

from conftest import init_vega

market_names = ["ETHBTC.QM21", "BTCUSD.MF21", "SOLUSD", "AAPL.MF21"]


@pytest.fixture(scope="module")
def vega():
    with init_vega() as vega:
        yield vega


@pytest.fixture(scope="module")
def create_markets(vega):
    for market_name in market_names:
        setup_continuous_market(vega, custom_market_name=market_name)


@pytest.mark.usefixtures("risk_accepted")
def test_table_headers(page: Page, create_markets):
    page.goto(f"/#/markets/all")
    headers = [
        "Market",
        "Description",
        "Settlement asset",
        "Trading mode",
        "Status",
        "Mark price",
        "24h volume",
        "Open Interest",
        "Spread",
        "",
    ]
    page.wait_for_selector('[data-testid="tab-open-markets"]', state="visible")
    page_headers = (
        page.get_by_test_id("tab-open-markets").locator(".ag-header-cell-text").all()
    )
    for i, header in enumerate(headers):
        expect(page_headers[i]).to_have_text(header)


@pytest.mark.usefixtures("risk_accepted")
def test_markets_tab(page: Page, create_markets):
    page.goto(f"/#/markets/all")
    expect(page.get_by_test_id("Open markets")).to_have_attribute(
        "data-state", "active"
    )
    expect(page.get_by_test_id("Proposed markets")).to_have_attribute(
        "data-state", "inactive"
    )
    expect(page.get_by_test_id("Closed markets")).to_have_attribute(
        "data-state", "inactive"
    )


@pytest.mark.usefixtures("risk_accepted")
def test_markets_content(page: Page, create_markets):
    page.goto(f"/#/markets/all")
    row_selector = page.locator(
        '[data-testid="tab-open-markets"] .ag-center-cols-container .ag-row'
    ).first
    instrument_code_locator = '[col-id="tradableInstrument.instrument.code"] [data-testid="stack-cell-primary"]'
    # 6001-MARK-035
    expect(row_selector.locator(instrument_code_locator)).to_have_text("ETHBTC.QM21")

    # 6001-MARK-073
    expect(row_selector.locator('[title="Future"]')).to_have_text("Futr")

    #  6001-MARK-036
    expect(
        row_selector.locator('[col-id="tradableInstrument.instrument.name"]')
    ).to_have_text("ETHBTC.QM21")

    #  6001-MARK-037
    expect(row_selector.locator('[col-id="tradingMode"]')).to_have_text("Continuous")

    #  6001-MARK-038
    expect(row_selector.locator('[col-id="state"]')).to_have_text("Active")

    #  6001-MARK-039
    expect(row_selector.locator('[col-id="data.markPrice"]')).to_have_text("107.50")

    #  6001-MARK-040
    expect(row_selector.locator('[col-id="data.candles"]')).to_have_text("0.00")

    #  6001-MARK-042
    expect(
        row_selector.locator(
            '[col-id="tradableInstrument.instrument.product.settlementAsset.symbol"]'
        )
    ).to_have_text("tDAI")

    expect(row_selector.locator('[col-id="data.bestBidPrice"]')).to_have_text("2")

    # 6001-MARK-043
    row_selector.locator(
        '[col-id="tradableInstrument.instrument.product.settlementAsset.symbol"] button'
    ).click()
    expect(page.get_by_test_id("dialog-title")).to_have_text("Asset details - tDAI")
    # 6001-MARK-019
    page.get_by_test_id("close-asset-details-dialog").click()


@pytest.mark.usefixtures("risk_accepted")
def test_market_actions(page: Page, create_markets):
    # 6001-MARK-044
    # 6001-MARK-045
    # 6001-MARK-046
    # 6001-MARK-047
    page.goto(f"/#/markets/all")
    page.locator(
        '.ag-pinned-right-cols-container [col-id="market-actions"]'
    ).first.locator("button").click()

    actions = [
        "Copy Market ID",
        "View on Explorer",
        "View settlement asset details",
    ]
    action_elements = (
        page.get_by_test_id("market-actions-content").get_by_role("menuitem").all()
    )

    for i, action in enumerate(actions):
        expect(action_elements[i]).to_have_text(action)


@pytest.mark.usefixtures("risk_accepted")
def test_sort_markets(page: Page, create_markets):
    # 6001-MARK-064

    page.goto(f"/#/markets/all")
    sorted_market_names = [
        "AAPL.MF21",
        "BTCUSD.MF21",
        "ETHBTC.QM21",
        "SOLUSD",
    ]
    page.locator('.ag-header-row [col-id="tradableInstrument.instrument.code"]').click()
    for i, market_name in enumerate(sorted_market_names):
        expect(
            page.locator(
                f'[row-index="{i}"] [col-id="tradableInstrument.instrument.name"]'
            )
        ).to_have_text(market_name)


@pytest.mark.usefixtures("risk_accepted")
def test_drag_and_drop_column(page: Page, create_markets):
    # 6001-MARK-065
    page.goto(f"/#/markets/all")
    col_instrument_code = '.ag-header-row [col-id="tradableInstrument.instrument.code"]'

    page.locator(col_instrument_code).drag_to(
        page.locator('.ag-header-row [col-id="data.bestBidPrice"]')
    )
    expect(page.locator(col_instrument_code)).to_have_attribute("aria-colindex", "9")
