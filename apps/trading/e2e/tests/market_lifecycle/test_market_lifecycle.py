import pytest
import re
import vega_sim.api.governance as governance
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService, PeggedOrder
import vega_sim.api.governance as governance
import vega_sim.proto.vega as vega_protos
from actions.vega import submit_order
from actions.utils import next_epoch
from wallet_config import MM_WALLET, MM_WALLET2, GOVERNANCE_WALLET
from datetime import datetime, timedelta

@pytest.mark.usefixtures("risk_accepted")
def test_market_lifecycle(proposed_market, vega: VegaService, page: Page):
    # 7002-SORD-001
    # 7002-SORD-002
    trading_mode = page.get_by_test_id("market-trading-mode").get_by_test_id(
        "item-value"
    )
    market_state = page.get_by_test_id("market-state").get_by_test_id("item-value")

    # setup market in proposed step, without liquidity provided
    market_id = proposed_market
    page.goto(f"/#/markets/{market_id}")
    # 6002-MDET-001
    expect(page.get_by_test_id("header-title")).to_have_text("BTC:DAI_2023Futr")
    # 6002-MDET-002
    expect(page.get_by_test_id("market-expiry")).to_have_text("ExpiryNot time-based")
    page.get_by_test_id("market-expiry").hover()
    expect(page.get_by_test_id("expiry-tooltip").first).to_have_text(
        "This market expires when triggered by its oracle, not on a set date.View oracle specification"
    )
    expect(
        page.get_by_test_id("expiry-tooltip").first.get_by_test_id("link")
    ).to_have_attribute("href", re.compile(".*"))
    # 6002-MDET-003
    expect(page.get_by_test_id("market-price")).to_have_text("Mark Price0.00")
    # 6002-MDET-004
    expect(page.get_by_test_id("market-change")).to_have_text("Change (24h)0.00%0.00")
    # 6002-MDET-005
    expect(page.get_by_test_id("market-volume")).to_have_text("Volume (24h)-")
    # 6002-MDET-008
    expect(page.get_by_test_id("market-settlement-asset")).to_have_text(
        "Settlement assettDAI"
    )
    expect(page.get_by_test_id("liquidity-supplied")).to_have_text(
        "Liquidity supplied 0.00 (0.00%)"
    )
    page.get_by_test_id("liquidity-supplied").hover()
    expect(page.get_by_test_id("liquidity-supplied-tooltip").first).to_have_text(
        "Supplied stake0.00Target stake0.00View liquidity provision tableLearn about providing liquidity"
    )
    expect(
        page.get_by_test_id("liquidity-supplied-tooltip")
        .first.get_by_test_id("link")
        .first
    ).to_have_text("View liquidity provision table")
    # check that market is in proposed state
    # 6002-MDET-006
    # 6002-MDET-007
    # 7002-SORD-061
    expect(trading_mode).to_have_text("No trading")
    trading_mode.hover()
    expect(page.get_by_test_id("trading-mode-tooltip").first).to_have_text(
        "No trading enabled for this market."
    )
    expect(market_state).to_have_text("Proposed")

    # approve market
    governance.approve_proposal(
        key_name=MM_WALLET.name,
        proposal_id=market_id,
        wallet=vega.wallet,
    )

    # "wait" for market to be approved and enacted
    vega.forward("60s")
    vega.wait_fn(10)
    vega.wait_for_total_catchup()
    next_epoch(vega=vega)
    # check that market is in pending state
    expect(trading_mode).to_have_text("Opening auction")
    expect(market_state).to_have_text("Pending")

    # Add liquidity and place some orders. Orders should match to produce the uncrossing price. A market can only move from opening auction to continuous trading when the enactment date has passed, there is sufficient liquidity and an uncrossing price is produced.
    vega.submit_simple_liquidity(
        key_name=MM_WALLET.name,
        market_id=market_id,
        commitment_amount=10000,
        fee=0.000,
        is_amendment=False,
    )

    vega.submit_order(
        market_id=market_id,
        trading_key=MM_WALLET.name,
        side="SIDE_BUY",
        order_type="TYPE_LIMIT",
        pegged_order=PeggedOrder(reference="PEGGED_REFERENCE_MID", offset=1),
        wait=False,
        time_in_force="TIME_IN_FORCE_GTC",
        volume=99,
    )
    vega.submit_order(
        market_id=market_id,
        trading_key=MM_WALLET.name,
        side="SIDE_SELL",
        order_type="TYPE_LIMIT",
        pegged_order=PeggedOrder(reference="PEGGED_REFERENCE_MID", offset=1),
        wait=False,
        time_in_force="TIME_IN_FORCE_GTC",
        volume=99,
    )

    submit_order(vega, MM_WALLET.name, market_id, "SIDE_SELL", 1, 110)
    submit_order(vega, MM_WALLET2.name, market_id, "SIDE_BUY", 1, 90)
    submit_order(vega, MM_WALLET.name, market_id, "SIDE_SELL", 1, 105)
    submit_order(vega, MM_WALLET2.name, market_id, "SIDE_BUY", 1, 95)
    submit_order(vega, MM_WALLET.name, market_id, "SIDE_SELL", 1, 100)
    submit_order(vega, MM_WALLET2.name, market_id, "SIDE_BUY", 1, 100)

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    # check market state is now active and trading mode is continuous
    expect(trading_mode).to_have_text("Continuous")
    expect(market_state).to_have_text("Active")

    proposal_id = vega.update_market_state(
        market_id,
        GOVERNANCE_WALLET.name,
        vega_protos.governance.MarketStateUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE,
        approve_proposal=False,
        vote_enactment_time = datetime.now() + timedelta(weeks=1),
        forward_time_to_enactment = False,
        price=107,
    )

    # TODO assert that market upade banner is shown

    # put invalid oracle to trigger market termination
    governance.submit_oracle_data(
        wallet=vega.wallet,
        payload={"trading.terminated": "true"},
        key_name=GOVERNANCE_WALLET.name,
    )
    vega.forward("60s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    # market state should be changed to "Trading Terminated" because of the invalid oracle
    expect(trading_mode).to_have_text("No trading")
    expect(market_state).to_have_text("Trading Terminated")

    # settle market
    vega.submit_termination_and_settlement_data(
        settlement_key=GOVERNANCE_WALLET.name,
        settlement_price=100,
        market_id=market_id,
    )
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    # check market state is now settled
    expect(trading_mode).to_have_text("No trading")
    expect(market_state).to_have_text("Settled")


""" @pytest.mark.usefixtures("page", "risk_accepted", "continuous_market")
def test_market_closing_banners(page: Page, continuous_market, vega: VegaService):
    market_id = continuous_market
    page.goto(f"/#/markets/{market_id}")
    proposalID = vega.update_market_state(
        continuous_market,
        "market_maker",
        MarketStateUpdateType.Terminate,
        approve_proposal=False,
        vote_enactment_time = datetime.now() + timedelta(weeks=1),
        forward_time_to_enactment = False,
        price=107,
    )
    may_close_warning_pattern = r"TRADING ON MARKET BTC:DAI_2023 MAY STOP ON \d+ \w+\.\s*THERE IS OPEN PROPOSAL TO CLOSE THIS MARKET\.\nProposed final price is 107\.00 BTC\.\nView proposal"
    match_result = re.fullmatch(may_close_warning_pattern, page.locator(".grow").inner_text())
    assert match_result is not None

    vega.update_market_state(
        continuous_market,
        "market_maker",
        MarketStateUpdateType.Terminate,
        approve_proposal=False,
        vote_enactment_time = datetime.now() + timedelta(weeks=1),
        forward_time_to_enactment = False,
        price=110,
    )

    expect(page.locator(".grow")).to_have_text("Trading on Market BTC:DAI_2023 may stop. There are open proposals to close this marketView proposals")

    governance.approve_proposal(
        proposal_id=proposalID,
        wallet=vega.wallet,
        key_name="market_maker"

    )
    vega.forward("60s")
    vega.wait_fn(10)
    vega.wait_for_total_catchup()

    will_close_pattern = r"TRADING ON MARKET BTC:DAI_2023 WILL STOP ON \d+ \w+\nYou will no longer be able to hold a position on this market when it closes in \d+ days \d+ hours\. The final price will be 107\.00 BTC\."
    match_result = re.fullmatch(will_close_pattern, page.locator(".grow").inner_text())
    assert match_result is not None
     """
