import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from fixtures.market import setup_continuous_market
from wallet_config import MM_WALLET, MM_WALLET2, GOVERNANCE_WALLET
from actions.vega import submit_multiple_orders, submit_order, submit_liquidity

@pytest.mark.usefixtures("page", "risk_accepted")
def test_succession_line(vega: VegaService, page: Page):
    parent_market_id = setup_continuous_market(vega)
    tdai_id = vega.find_asset_id(symbol="tDAI")

    page.goto(f"/#/markets/{parent_market_id}")

    # market in normal state no banner shown
    expect(page.get_by_test_id("market-banner")).not_to_be_attached()

    successor_name = "successor market name"
    successor_id = propose_successor(vega, parent_market_id, tdai_id, successor_name)

    # Check that the banner notifying about the successor proposal is shown
    banner = page.get_by_test_id("market-banner")
    expect(banner).to_be_attached()
    expect(banner.get_by_text("A successor to this market has been proposed")).to_be_visible()

    vega.forward("120s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    # Banner should not show after market has enacted
    expect(page.get_by_test_id("market-banner")).not_to_be_attached()

    # Check that the newly created market has the correct succession line
    # shown in market info
    provide_successor_liquidity(vega, successor_id)

    page.goto(f"/#/markets/{successor_id}")

    page.get_by_test_id("Info").click()

    # Close toasts if present due to proposals
    page.get_by_role("button", name="Dismiss all").click()

    page.get_by_role("button", name="Succession line").click()

    succession_item = page.get_by_test_id("succession-line-item")

    expect(succession_item.first).to_contain_text(
        "successor market name"
    )
    expect(
        succession_item.first.get_by_role("link")
    ).to_be_attached
    expect(
        succession_item.last.get_by_role("link")
    ).to_be_attached
    expect(
        succession_item.last.get_by_test_id("icon-bullet")
    ).to_be_visible

    # Settle parent market and check that successor banner is showing
    vega.submit_termination_and_settlement_data(
        settlement_key=GOVERNANCE_WALLET.name,
        settlement_price=100,
        market_id=parent_market_id,
    )
    vega.forward("20s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

    page.goto(f"/#/markets/{parent_market_id}")

    banner = page.get_by_test_id("market-banner")
    expect(banner).to_be_attached()
    expect(banner.get_by_text("This market has been succeeded")).to_be_visible()


def propose_successor(
    vega: VegaService, parent_market_id, tdai_id, market_name
):
    market_id = vega.create_simple_market(
        market_name,
        proposal_key=MM_WALLET.name,
        settlement_asset_id=tdai_id,
        termination_key=MM_WALLET2.name,
        market_decimals=5,
        approve_proposal=True,
        forward_time_to_enactment=False,
        parent_market_id=parent_market_id,
        parent_market_insurance_pool_fraction=0.5,
    )
    return market_id

def provide_successor_liquidity(
    vega: VegaService, market_id
):
    submit_liquidity(vega, MM_WALLET.name, market_id)
    submit_multiple_orders(
        vega, MM_WALLET.name, market_id, "SIDE_SELL", [[1, 110], [1, 105]]
    )
    submit_multiple_orders(
        vega, MM_WALLET2.name, market_id, "SIDE_BUY", [[1, 90], [1, 95]]
    )

    submit_order(vega, "Key 1", market_id, "SIDE_BUY", 1, 110)

    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()

