import pytest
import re
import vega_sim.api.governance as governance
from vega_sim.null_service import VegaServiceNull
from playwright.sync_api import Page, expect
from fixtures.market import setup_continuous_market
from conftest import init_vega, cleanup_container
from actions.utils import next_epoch


@pytest.fixture(scope="class")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance


@pytest.fixture(scope="class")
def create_settled_market(vega: VegaServiceNull):
    market_id = setup_continuous_market(vega)
    vega.submit_termination_and_settlement_data(
        settlement_key="FJMKnwfZdd48C8NqvYrG",
        settlement_price=110,
        market_id=market_id,
    )
    next_epoch(vega=vega)


class TestSettledMarket:
    @pytest.mark.usefixtures("risk_accepted", "auth")
    def test_settled_header(self, page: Page, create_settled_market):
        page.goto(f"/#/markets/all")
        page.locator("id=closed-markets").click()
        headers = [
            "Market",
            "Status",
            "Settlement date",
            "Best bid",
            "Best offer",
            "Price",
        ]

        page_headers = (
            page.locator(".ag-header-container").locator(".ag-header-cell-text").all()
        )
        for i, header in enumerate(headers):
            expect(page_headers[i]).to_have_text(header)

    @pytest.mark.usefixtures(
        "risk_accepted",
        "auth",
    )
    def test_settled_rows(self, page: Page, create_settled_market):
        page.goto(f"/#/markets/all")
        page.locator("id=closed-markets").click()
        row_selector = page.locator('div[row-index="0"]')
        # 6001-MARK-001
        expect(row_selector.locator('div[col-id="code"]')).to_have_text(
            "BTC:DAI_2023Futr"
        )
        # 6001-MARK-003
        page.pause()
        expect(row_selector.locator('div[col-id="state"]')).to_have_text("Settled")
        # 6001-MARK-004
        # 6001-MARK-005
        # 6001-MARK-009
        # 6001-MARK-008
        # 6001-MARK-010
        pattern = re.compile(
            r"(Expected in )?(\d+)\s+(months|hours|days|minutes)( ago)?"
        )

        date_text = row_selector.locator('div[col-id="settlementDate"]').inner_text()
        assert pattern.match(
            date_text
        ), f"Expected href to match {pattern}, but got {date_text}"

        expected_pattern = re.compile(r"https://.*?/oracles/[a-f0-9]{64}")
        actual_href = row_selector.locator(
            'div[col-id="settlementDate"] [data-testid="link"]'
        ).get_attribute("href")
        assert expected_pattern.match(
            actual_href
        ), f"Expected href to match {expected_pattern.pattern}, but got {actual_href}"
        # 6001-MARK-011
        expect(row_selector.locator('div[col-id="bestBidPrice"]')).to_have_text("0.00")
        # 6001-MARK-012
        expect(row_selector.locator('div[col-id="bestOfferPrice"]')).to_have_text("0.00")
        # 6001-MARK-013
        expect(row_selector.locator('div[col-id="markPrice"]')).to_have_text("110.00")


@pytest.mark.usefixtures("risk_accepted", "auth")
def test_terminated_market_no_settlement_date(page: Page, vega: VegaServiceNull):
    setup_continuous_market(vega)
    print("I have started test_terminated_market_no_settlement_date")
    governance.submit_oracle_data(
        wallet=vega.wallet,
        payload={"trading.terminated": "true"},
        key_name="FJMKnwfZdd48C8NqvYrG",
    )
    next_epoch(vega=vega)
    page.goto(f"/#/markets/all")
    page.locator("id=closed-markets").click()
    row_selector = page.locator('div[row-index="0"]')
    expect(row_selector.locator('div[col-id="state"]')).to_have_text("Trading Terminated")
    expect(row_selector.locator('div[col-id="settlementDate"]')).to_have_text("Unknown")

    # TODO Create test for terminated market with settlement date in future
    # TODO Create test for terminated market with settlement date in past
