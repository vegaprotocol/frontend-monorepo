import pytest
import re
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from vega_sim.service import MarketStateUpdateType
from datetime import datetime, timedelta
from conftest import init_vega
from actions.utils import change_keys
from actions.vega import submit_multiple_orders
from fixtures.market import setup_perps_market
from wallet_config import MM_WALLET, MM_WALLET2, TERMINATE_WALLET

row_selector = '[data-testid="tab-funding-payments"] .ag-center-cols-container .ag-row'
col_amount = '[col-id="amount"]'

class TestPerpetuals:

    @pytest.fixture(scope="class")
    def vega(self, request):
        with init_vega(request) as vega:
            yield vega

    @pytest.fixture(scope="class")
    def perps_market(self, vega: VegaService):
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
        vega.forward("10s")
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
        vega.forward("10s")
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        return perps_market

    @pytest.mark.usefixtures("page","risk_accepted", "auth")
    def test_funding_payment_profit(self, perps_market, page: Page):
        page.goto(f"/#/markets/{perps_market}")    
        page.get_by_test_id("Funding payments").click()
        row = page.locator(row_selector)
        expect(row.locator(col_amount)).to_have_text("9.00 tDAI")

    @pytest.mark.usefixtures("page","risk_accepted", "auth")
    def test_funding_payment_loss(self, perps_market, page: Page, vega):
        page.goto(f"/#/markets/{perps_market}")   
        change_keys(page, vega, "market_maker")
        page.get_by_test_id("Funding payments").click()
        row = page.locator(row_selector)
        expect(row.locator(col_amount)).to_have_text("-27.00 tDAI")
        
    @pytest.mark.usefixtures("page","risk_accepted", "auth")
    def test_funding_header(self, perps_market, page: Page):
        page.goto(f"/#/markets/{perps_market}")
        expect(page.get_by_test_id("market-funding")).to_contain_text("Funding Rate / Countdown-8.1818%")
        expect(page.get_by_test_id("index-price")).to_have_text("Index Price110.00")

    @pytest.mark.skip("Skipped due to issue #5421")
    @pytest.mark.usefixtures("page","risk_accepted", "auth")
    def test_funding_payment_history(perps_market, page: Page, vega):
        page.goto(f"/#/markets/{perps_market}")   
        change_keys(page, vega, "market_maker")
        page.get_by_test_id("Funding history").click()
        element = page.get_by_test_id("tab-funding-history")
        # Get the bounding box of the element
        bounding_box = element.bounding_box()
        if bounding_box:
            bottom_right_x = bounding_box["x"] + bounding_box["width"]
            bottom_right_y = bounding_box["y"] + bounding_box["height"]

            # Hover over the bottom-right corner of the element
            element.hover(position={"x": bottom_right_x, "y": bottom_right_y})
        else:
            print("Bounding box not found for the element")

@pytest.mark.usefixtures("page","risk_accepted", "auth")
def test_perps_market_termination_proposed(page: Page, vega: VegaService):
    perpetual_market = setup_perps_market(vega)
    page.goto(f"/#/markets/{perpetual_market}") 
    vega.update_market_state(
        proposal_key=MM_WALLET.name,
        market_id=perpetual_market,
        market_state=MarketStateUpdateType.Terminate,
        price=100,
        vote_closing_time = datetime.now() + timedelta(seconds=15),
        vote_enactment_time = datetime.now() + timedelta(seconds=60),
        approve_proposal = True,
        forward_time_to_enactment = False,
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    banner_text = page.get_by_test_id(f"termination-warning-banner-{perpetual_market}").text_content()
    pattern = re.compile(
    r"Trading on Market BTC:DAI_Perpetual may stop on \d{2} [A-Za-z]+\. There is open proposal to close this market\.Proposed final price is 100\.00 BTC\.View proposal"
    )
    assert pattern.search(banner_text), f"Text did not match pattern. Text was: {banner_text}"

@pytest.mark.usefixtures("page","risk_accepted", "auth" )
def test_perps_market_terminated(page: Page, vega: VegaService):
    perpetual_market = setup_perps_market(vega)
    page.goto(f"/#/markets/{perpetual_market}") 
    vega.update_market_state(
        proposal_key=MM_WALLET.name,
        market_id=perpetual_market,
        market_state=MarketStateUpdateType.Terminate,
        price=100,
        approve_proposal = True,
        forward_time_to_enactment = True,
    )
    expect(page.get_by_test_id("market-price")).to_have_text("Mark Price100.00")
    expect(page.get_by_test_id("market-change")).to_have_text("Change (24h)-")
    expect(page.get_by_test_id("market-volume")).to_have_text("Volume (24h)-")
    expect(page.get_by_test_id("market-trading-mode")).to_have_text("Trading modeNo trading")
    expect(page.get_by_test_id("market-state")).to_have_text("StatusClosed")
    expect(page.get_by_test_id("liquidity-supplied")).to_have_text("Liquidity supplied 0.00 (0.00%)")
    expect(page.get_by_test_id("market-funding")).to_have_text("Funding Rate / Countdown-Unknown")
    expect(page.get_by_test_id("index-price")).to_have_text("Index Price0.00 ")
    expect(page.get_by_test_id("deal-ticket-error-message-summary")).to_have_text("This market is closed and not accepting orders")