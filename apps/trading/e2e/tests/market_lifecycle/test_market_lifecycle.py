import pytest
import vega_sim.api.governance as governance
import re

from collections import namedtuple
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService, PeggedOrder
import vega_sim.proto.vega as vega_protos
import vega_sim.api.governance as governance
from actions.vega import submit_order
from fixtures.market import setup_continuous_market
from datetime import datetime
from datetime import timedelta
from vega_sim.service import MarketStateUpdateType

# Defined namedtuples
WalletConfig = namedtuple("WalletConfig", ["name", "passphrase"])

# Wallet Configurations
MM_WALLET = WalletConfig("mm", "pin")
MM_WALLET2 = WalletConfig("mm2", "pin2")
GOVERNANCE_WALLET = WalletConfig("FJMKnwfZdd48C8NqvYrG", "bY3DxwtsCstMIIZdNpKs")

wallets = [MM_WALLET, MM_WALLET2, GOVERNANCE_WALLET]


@pytest.mark.usefixtures("vega", "page", "proposed_market", "risk_accepted")
def test_market_lifecycle(proposed_market, vega: VegaService, page: Page):
    trading_mode = page.get_by_test_id("market-trading-mode").get_by_test_id(
        "item-value"
    )
    market_state = page.get_by_test_id("market-state").get_by_test_id("item-value")

    # setup market in proposed step, without liquidity provided
    market_id = proposed_market
    page.goto(f"/#/markets/{market_id}")

    # check that market is in proposed state
    # 6002-MDET-006
    # 6002-MDET-007
    # 7002-SORD-061
    expect(trading_mode).to_have_text("No trading")
    expect(market_state).to_have_text("Proposed")

    # approve market
    governance.approve_proposal(
        key_name=MM_WALLET.name,
        proposal_id=market_id,
        wallet=vega.wallet,
    )

    # "wait" for market to be approved and enacted
    vega.forward("60s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

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
        "mm",
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
        "mm",
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
        key_name="mm"
        
    )
    vega.forward("60s")
    vega.wait_fn(10)
    vega.wait_for_total_catchup()
  
    will_close_pattern = r"TRADING ON MARKET BTC:DAI_2023 WILL STOP ON \d+ \w+\nYou will no longer be able to hold a position on this market when it closes in \d+ days \d+ hours\. The final price will be 107\.00 BTC\."
    match_result = re.fullmatch(will_close_pattern, page.locator(".grow").inner_text())
    assert match_result is not None
     """