import pytest
import re
import vega_sim.api.governance as governance
from vega_sim.service import VegaService
from playwright.sync_api import Page, expect
from fixtures.market import setup_continuous_market
from conftest import init_vega


@pytest.fixture(scope="class")
def vega():
    with init_vega() as vega:
        yield vega

@pytest.fixture(scope="class")
def create_settled_market(vega: VegaService):
    market_id = setup_continuous_market(vega)
    vega.submit_termination_and_settlement_data(
        settlement_key="FJMKnwfZdd48C8NqvYrG",
        settlement_price=110,
        market_id=market_id,
    )
    vega.forward("10s")
    vega.wait_fn(10)
    vega.wait_for_total_catchup()


class TestSettledMarket:
    @pytest.mark.usefixtures("risk_accepted", "auth")
    def test_settled_header(self, page: Page, create_settled_market):
        page.goto(f"/#/markets/all")
        page.get_by_test_id("Closed markets").click()
        headers = [
            "Market",
            "Status",
            "Settlement date",
            "Best bid",
            "Best offer",
            "Mark price",
            "Settlement price",
            "Settlement asset",
            "",
        ]

        page.wait_for_selector('[data-testid="tab-closed-markets"]', state="visible")
        page_headers = (
            page.get_by_test_id("tab-closed-markets")
            .locator(".ag-header-cell-text")
            .all()
        )
        for i, header in enumerate(headers):
            expect(page_headers[i]).to_have_text(header)

    @pytest.mark.usefixtures(
        "risk_accepted",
        "auth",
    )
    def test_settled_rows(self, page: Page, create_settled_market):
        page.goto(f"/#/markets/all")
        page.get_by_test_id("Closed markets").click()

        row_selector = page.locator(
            '[data-testid="tab-closed-markets"] .ag-center-cols-container .ag-row'
        ).first

        # 6001-MARK-001
        expect(row_selector.locator('[col-id="code"]')).to_have_text("BTC:DAI_2023Futr")
        # 6001-MARK-003
        expect(row_selector.locator('[col-id="state"]')).to_have_text("Settled")
        # 6001-MARK-004
        # 6001-MARK-005
        # 6001-MARK-009
        # 6001-MARK-008
        # 6001-MARK-010
        pattern = r"(\d+)\s+months\s+ago"
        date_text = row_selector.locator('[col-id="settlementDate"]').inner_text()
        assert re.match(pattern, date_text), f"Expected text to match pattern but got {date_text}"
       

        expected_pattern = re.compile(r"https://.*?/oracles/[a-f0-9]{64}")
        actual_href = row_selector.locator(
            '[col-id="settlementDate"] [data-testid="link"]'
        ).get_attribute("href")
        assert expected_pattern.match(
            actual_href
        ), f"Expected href to match {expected_pattern.pattern}, but got {actual_href}"
        # 6001-MARK-011
        expect(row_selector.locator('[col-id="bestBidPrice"]')).to_have_text("0.00")
        # 6001-MARK-012
        expect(row_selector.locator('[col-id="bestOfferPrice"]')).to_have_text("0.00")
        # 6001-MARK-013 
        expect(row_selector.locator('[col-id="markPrice"]')).to_have_text("110.00")
        # 6001-MARK-014
        # 6001-MARK-015
        # 6001-MARK-016
        #tbd currently we have value unknown 
        # expect(row_selector.locator('[col-id="settlementDataOracleId"]')).to_have_text(
        #     "110.00"
        # )
        expected_pattern = re.compile(r"https://.*?/oracles/[a-f0-9]{64}")
        actual_href = row_selector.locator(
            '[col-id="settlementDataOracleId"] [data-testid="link"]'
        ).get_attribute("href")
        assert expected_pattern.match(
            actual_href
        ), f"Expected href to match {expected_pattern.pattern}, but got {actual_href}"

        # 6001-MARK-018
        expect(row_selector.locator('[col-id="settlementAsset"]')).to_have_text("tDAI")
        # 6001-MARK-020
        assert re.match(pattern, date_text), f"Expected text to match pattern but got {date_text}"


@pytest.mark.usefixtures("risk_accepted", "auth")
def test_terminated_market_no_settlement_date(page: Page, vega: VegaService):
    setup_continuous_market(vega)
    print("I have started test_terminated_market_no_settlement_date")
    governance.submit_oracle_data(
        wallet=vega.wallet,
        payload={"trading.terminated": "true"},
        key_name="FJMKnwfZdd48C8NqvYrG",
    )
    vega.forward("60s")
    vega.wait_fn(10)
    vega.wait_for_total_catchup()
    page.goto(f"/#/markets/all")
    page.get_by_test_id("Closed markets").click()
    row_selector = page.locator(
        '[data-testid="tab-closed-markets"] .ag-center-cols-container .ag-row'
    ).first
    expect(row_selector.locator('[col-id="state"]')).to_have_text("Trading Terminated")
    expect(row_selector.locator('[col-id="settlementDate"]')).to_have_text("Unknown")

    # TODO Create test for terminated market with settlement date in future
    # TODO Create test for terminated market with settlement date in past
