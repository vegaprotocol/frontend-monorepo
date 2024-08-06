import pytest
import re
from typing import Generator, Tuple
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from vega_sim.service import MarketStateUpdateType
from datetime import datetime, timedelta
from conftest import (
    init_vega,
    cleanup_container,
    auth_setup,
    risk_accepted_setup,
    init_page,
)
from actions.utils import change_keys
from actions.vega import submit_multiple_orders
from fixtures.market import setup_perps_market
from wallet_config import MM_WALLET, MM_WALLET2, TERMINATE_WALLET

row_selector = '[data-testid="tab-funding-payments"] .ag-center-cols-container .ag-row'
col_amount = '[col-id="amount"]'


@pytest.fixture(scope="module")
def setup_environment(
    request, browser
) -> Generator[Tuple[Page, VegaServiceNull, str], None, None]:
    with init_vega(request) as vega:
        request.addfinalizer(lambda: cleanup_container(vega))
        perps_market = setup_perps_market(vega)
        submit_multiple_orders(
            vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
        )
        submit_multiple_orders(
            vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
        )
        vega.submit_settlement_data(
            settlement_key=TERMINATE_WALLET.name,
            settlement_price=110,
            market_id=perps_market,
        )
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        submit_multiple_orders(
            vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
        )
        submit_multiple_orders(
            vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
        )
        vega.submit_settlement_data(
            settlement_key=TERMINATE_WALLET.name,
            settlement_price=110,
            market_id=perps_market,
        )
        vega.wait_fn(10)
        vega.wait_for_total_catchup()

        with init_page(vega, browser, request) as page:
            risk_accepted_setup(page)
            auth_setup(vega, page)
            yield page, vega, perps_market


class TestPerpetuals:
    def test_funding_payment_profit(
        self,
        setup_environment: Tuple[Page, str, str],
    ) -> None:
        page, vega, perps_market = setup_environment
        page.goto(f"/#/markets/{perps_market}")
        page.get_by_test_id("Funding payments").click()
        row = page.locator(row_selector)
        expect(row.locator(col_amount)).to_have_text("4.45 tDAI")

    def test_funding_payment_loss(
        self,
        setup_environment: Tuple[Page, str, str],
    ) -> None:
        page, vega, perps_market = setup_environment
        page.goto(f"/#/markets/{perps_market}")
        change_keys(page, vega, "market_maker")
        page.get_by_test_id("Funding payments").click()
        row = page.locator(row_selector)
        expect(row.locator(col_amount)).to_have_text("-13.35 tDAI")

    def test_funding_header(
        self,
        setup_environment: Tuple[Page, str, str],
    ) -> None:
        page, vega, perps_market = setup_environment
        page.goto(f"/#/markets/{perps_market}")
        expect(page.get_by_test_id("market-funding")).to_contain_text(
            "Funding Rate / Countdown-8.1818%"
        )
        expect(page.get_by_test_id("index-price")).to_have_text("Index Price110.00")


@pytest.mark.usefixtures("risk_accepted", "auth")
def test_perps_market_termination_proposed(page: Page, vega: VegaServiceNull):
    perpetual_market = setup_perps_market(vega)
    page.goto(f"/#/markets/{perpetual_market}")
    vega.update_market_state(
        proposal_key=MM_WALLET.name,
        market_id=perpetual_market,
        market_state=MarketStateUpdateType.Terminate,
        price=100,
        vote_closing_time=datetime.fromtimestamp(
            vega.get_blockchain_time(in_seconds=True)
        )
        + timedelta(seconds=30),
        vote_enactment_time=datetime.fromtimestamp(
            vega.get_blockchain_time(in_seconds=True)
        )
        + timedelta(seconds=60),
        approve_proposal=True,
        forward_time_to_enactment=False,
    )

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    banner_text = page.get_by_test_id(
        f"update-state-banner-{perpetual_market}"
    ).text_content()
    pattern = re.compile(
        r"Trading on market BTC:DAI_Perpetual may close on \d{2} [A-Za-z]+ \d{2}\:\d{2}\. There is an open proposal to close this market\.Proposed final price is 100\.00 BTC\. View proposal"
    )
    assert pattern.search(
        banner_text
    ), f"Text did not match pattern. Text was: {banner_text}"


@pytest.mark.usefixtures("risk_accepted", "auth")
def test_perps_market_terminated(page: Page, vega: VegaServiceNull):
    perpetual_market = setup_perps_market(vega)
    vega.update_market_state(
        proposal_key=MM_WALLET.name,
        market_id=perpetual_market,
        market_state=MarketStateUpdateType.Terminate,
        price=100,
        approve_proposal=True,
        forward_time_to_enactment=True,
    )
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    page.goto(f"/#/markets/{perpetual_market}")
    # TODO change back to have text once bug #5465 is fixed
    expect(page.get_by_test_id("market-price")).to_have_text("Mark Price100.00")
    expect(page.get_by_test_id("market-change")).to_contain_text("Change (24h)")
    expect(page.get_by_test_id("market-volume")).to_contain_text("Volume (24h)")
    expect(page.get_by_test_id("market-trading-mode")).to_have_text(
        "Trading modeNo trading"
    )
    expect(page.get_by_test_id("market-state")).to_have_text("StatusClosed")
    expect(page.get_by_test_id("market-funding")).to_contain_text(
        "Funding Rate / Countdown"
    )
    expect(page.get_by_test_id("index-price")).to_contain_text("Index Price")
    expect(page.get_by_test_id("feedback-market-closed")).to_have_text(
        "This market is closed and not accepting orders"
    )
