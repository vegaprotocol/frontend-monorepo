import pytest
import re
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from vega_sim.service import MarketStateUpdateType
from datetime import datetime, timedelta
from actions.utils import change_keys
from actions.vega import submit_multiple_orders
from fixtures.market import setup_perps_market
from wallet_config import MM_WALLET, MM_WALLET2, GOVERNANCE_WALLET

row_selector = '[data-testid="tab-funding-payments"] .ag-center-cols-container .ag-row'
col_amount = '[col-id="amount"]'


@pytest.fixture(scope="session")
def perps_market(shared_vega: VegaServiceNull):
    keypairs = shared_vega.wallet.get_keypairs("MarketSim")
    proposal_key = keypairs.get('market_maker')
    termination_key=keypairs.get('FJMKnwfZdd48C8NqvYrG')
    mm_2_key=keypairs.get('market_maker_2')

    kwargs = {}
    if proposal_key is not None:
        kwargs['proposal_key'] = proposal_key
    if termination_key is not None:
        kwargs['termination_key'] = termination_key
    if mm_2_key is not None:
        kwargs['mm_2_key'] = mm_2_key

    perps_market = setup_perps_market(shared_vega, **kwargs)

    submit_multiple_orders(
        shared_vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        shared_vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 90], [1, 95]]
    )
    shared_vega.submit_settlement_data(
        settlement_key=GOVERNANCE_WALLET.name,
        settlement_price=110,
        market_id=perps_market,
    )
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    submit_multiple_orders(
        shared_vega, MM_WALLET.name, perps_market, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        shared_vega, MM_WALLET2.name, perps_market, "SIDE_BUY", [[1, 112], [1, 115]]
    )
    shared_vega.submit_settlement_data(
        settlement_key=GOVERNANCE_WALLET.name,
        settlement_price=110,
        market_id=perps_market,
    )
    shared_vega.wait_fn(10)
    shared_vega.wait_for_total_catchup()
    return perps_market

@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_funding_payment_profit(perps_market, shared_page: Page, shared_auth, shared_risk_accepted):
    shared_page.goto(f"/#/markets/{perps_market}")
    shared_page.get_by_test_id("Funding payments").click()
    row = shared_page.locator(row_selector)
    expect(row.locator(col_amount)).to_have_text("9.00 tDAI")

@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_funding_payment_loss(perps_market, shared_page: Page, shared_vega, shared_risk_accepted, shared_auth):
    shared_page.goto(f"/#/markets/{perps_market}")
    change_keys(shared_page, shared_vega, "market_maker")
    shared_page.get_by_test_id("Funding payments").click()
    row = shared_page.locator(row_selector)
    expect(row.locator(col_amount)).to_have_text("-27.00 tDAI")

@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_funding_header(perps_market, shared_page: Page, shared_auth, shared_risk_accepted):
    shared_page.goto(f"/#/markets/{perps_market}")
    expect(shared_page.get_by_test_id("market-funding")).to_contain_text(
        "Funding Rate / Countdown-8.1818%"
    )
    expect(shared_page.get_by_test_id("index-price")).to_have_text("Index Price110.00")

@pytest.mark.skip("Skipped due to issue #5421")
@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_funding_payment_history(perps_market, shared_page: Page, shared_vega, shared_auth, shared_risk_accepted):
    shared_page.goto(f"/#/markets/{perps_market}")
    change_keys(shared_page, shared_vega, "market_maker")
    shared_page.get_by_test_id("Funding history").click()
    element = shared_page.get_by_test_id("tab-funding-history")
    # Get the bounding box of the element
    bounding_box = element.bounding_box()
    if bounding_box:
        bottom_right_x = bounding_box["x"] + bounding_box["width"]
        bottom_right_y = bounding_box["y"] + bounding_box["height"]

        # Hover over the bottom-right corner of the element
        element.hover(position={"x": bottom_right_x, "y": bottom_right_y})
    else:
        print("Bounding box not found for the element")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_perps_market_termination_proposed(perps_market, shared_page: Page, shared_vega: VegaServiceNull, shared_auth, shared_risk_accepted):
    shared_vega.update_market_state(
        proposal_key=MM_WALLET.name,
        market_id=perps_market,
        market_state=MarketStateUpdateType.Terminate,
        price=100,
        vote_closing_time=datetime.now() + timedelta(seconds=15),
        vote_enactment_time=datetime.now() + timedelta(seconds=60),
        approve_proposal=True,
        forward_time_to_enactment=False,
    )

    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    shared_page.goto(f"/#/markets/{perps_market}")
    banner_text = shared_page.get_by_test_id(
        f"update-state-banner-{perps_market}"
    ).text_content()
    pattern = re.compile(
        r"Trading on market BTC:DAI_Perpetual may stop on \d{2} [A-Za-z]+\. There is an open proposal to close this market\.Proposed final price is 100\.00 BTC\. View proposal"
    )
    assert pattern.search(
        banner_text
    ), f"Text did not match pattern. Text was: {banner_text}"

