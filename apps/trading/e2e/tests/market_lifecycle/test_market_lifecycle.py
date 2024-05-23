import pytest
import re
from datetime import timedelta, datetime
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from vega_sim.service import PeggedOrder, MarketStateUpdateType
import vega_sim.api.governance as governance
from actions.vega import submit_order
from actions.utils import next_epoch
from wallet_config import MM_WALLET, MM_WALLET2, GOVERNANCE_WALLET
from vega_sim.api import governance


@pytest.mark.usefixtures("risk_accepted")
def test_market_lifecycle(proposed_market, vega: VegaServiceNull, page: Page):
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
    expect(page.get_by_test_id("market-change")).to_have_text("Change (24h)-")
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

    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    # "wait" for market to be approved and enacted
    next_epoch(vega=vega)
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

    vega.wait_fn(2)
    vega.wait_for_total_catchup()

    # check market state is now active and trading mode is continuous
    expect(trading_mode).to_have_text("Continuous")
    expect(market_state).to_have_text("Active")

    vega.update_market_state(
        market_id=market_id,
        proposal_key=MM_WALLET.name,
        market_state=MarketStateUpdateType.Suspend,
        forward_time_to_enactment=False,
    )

    expect(
        page.get_by_test_id("market-banner").get_by_test_id(
            f"update-state-banner-{market_id}"
        )
    ).to_be_visible()

    next_epoch(vega=vega)

    expect(page.get_by_test_id("market-banner")).to_have_text(
        "Market was suspended by governance"
    )

    # banner should not show after resume
    vega.update_market_state(
        market_id=market_id,
        proposal_key=MM_WALLET.name,
        market_state=MarketStateUpdateType.Resume,
        forward_time_to_enactment=False,
    )

    expect(page.get_by_test_id("market-banner")).to_have_text(
        " Trading on market BTC:DAI_2023 was suspended by governance. There are open proposals to resume trading on this market.View proposals1/2"
    )
    next_epoch(vega=vega)

    expect(page.get_by_test_id("market-banner")).not_to_be_visible()

    # TODO test update market, sim will currently auto approve and enacted
    # a market update proposals

    # put invalid oracle to trigger market termination
    governance.submit_oracle_data(
        wallet=vega.wallet,
        payload={"trading.terminated": "true"},
        key_name=GOVERNANCE_WALLET.name,
    )
    next_epoch(vega=vega)

    # market state should be changed to "No trading" because of the invalid oracle
    expect(trading_mode).to_have_text("No trading")
    expect(market_state).to_have_text("Trading Terminated")

    # settle market
    vega.submit_termination_and_settlement_data(
        settlement_key=GOVERNANCE_WALLET.name,
        settlement_price=100,
        market_id=market_id,
    )
    next_epoch(vega=vega)

    # check market state is now settled
    expect(trading_mode).to_have_text("No trading")
    expect(market_state).to_have_text("Settled")
    expect(page.get_by_test_id("market-banner")).to_have_text(
        "This market has been settled"
    )


@pytest.mark.usefixtures("page", "risk_accepted", "continuous_market")
def test_market_closing_banners(page: Page, continuous_market, vega: VegaServiceNull):
    market_id = continuous_market
    page.goto(f"/#/markets/{market_id}")
    proposalID = vega.update_market_state(
        continuous_market,
        "market_maker",
        MarketStateUpdateType.Terminate,
        approve_proposal=False,
        vote_enactment_time=datetime.now() + timedelta(weeks=1),
        forward_time_to_enactment=False,
        price=107,
    )
    may_close_warning_pattern = r"Trading on market BTC:DAI_2023 may close on \d+ \w+\.\s*There is an open proposal to close this market.\s*Proposed final price is 107\.00 BTC\.\s*View proposal"
    banner_locator = page.get_by_test_id(f"update-state-banner-{market_id}")
    banner_text = banner_locator.inner_text()
    match_result = re.fullmatch(may_close_warning_pattern, banner_text)

    assert match_result is not None, f"Banner text did not match expected pattern. Expected pattern: '{may_close_warning_pattern}'. Actual text: '{banner_text}'"

    governance.approve_proposal(
        proposal_id=proposalID, wallet=vega.wallet, key_name="market_maker"
    )
    vega.wait_fn(60)
    vega.wait_for_total_catchup()
    will_close_pattern = r"TRADING ON MARKET BTC:DAI_2023 WILL CLOSE ON \d+ \w+\s+You will no longer be able to hold a position on this market when it terminates in \d+ days \d+ hours\. The final price will be 107\.00 BTC\."
    banner_locator = page.get_by_test_id(f"update-state-banner-{market_id}")
    actual_text = banner_locator.inner_text()
    match_result = re.fullmatch(will_close_pattern, actual_text)
    assert match_result is not None, f"Banner text did not match expected pattern. Expected pattern: '{will_close_pattern}'. Actual text: '{actual_text}'"
