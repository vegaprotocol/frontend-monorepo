import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from fixtures.market import setup_continuous_market
from wallet_config import MM_WALLET, MM_WALLET2, GOVERNANCE_WALLET
from actions.vega import submit_multiple_orders, submit_order, submit_liquidity
from actions.utils import next_epoch

market_banner = "market-banner"

@pytest.mark.usefixtures("risk_accepted")
def test_succession_line(vega: VegaServiceNull, page: Page):
    parent_market_id = setup_continuous_market(vega)
    tdai_id = vega.find_asset_id(symbol="tDAI")

    page.goto(f"/#/markets/{parent_market_id}")

    # market in normal state no banner shown
    expect(page.get_by_test_id(market_banner)).not_to_be_attached()

    successor_name = "successor market name"
    successor_id = propose_successor(vega, parent_market_id, tdai_id, successor_name)

    # Check that the banner notifying about the successor proposal is shown
    banner = page.get_by_test_id(market_banner)
    expect(banner).to_be_attached()
    expect(banner.get_by_text("A successor to this market has been proposed")).to_be_visible()

    next_epoch(vega)

    # Banner should not show after market has enacted
    expect(page.get_by_test_id(market_banner)).not_to_be_attached()

    # Check that the newly created market has the correct succession line
    # shown in market info
    provide_successor_liquidity(vega, successor_id)

    next_epoch(vega)

    page.goto(f"/#/markets/{successor_id}")

    # Page reload required as the data provider doesnt receive the new market
    # This also clears any toasts which can block the market info panel containing
    # the succession line
    page.reload()

    #tbd issue - 5546
    # page.get_by_test_id("Info").click()

    # page.get_by_role("button", name="Succession line").click()

    # succession_item = page.get_by_test_id("succession-line-item")

    # expect(succession_item.nth(1)).to_contain_text(
    #     "successor market name"
    # )
    # expect(
    #     succession_item.first.get_by_role("link")
    # ).to_be_attached
    # expect(
    #     succession_item.last.get_by_role("link")
    # ).to_be_attached
    # expect(
    #     succession_item.last.get_by_test_id("icon-bullet")
    # ).to_be_visible

    page.goto(f"/#/markets/{parent_market_id}")
    # Settle parent market and check that successor banner is showing
    vega.submit_termination_and_settlement_data(
        settlement_key=GOVERNANCE_WALLET.name,
        settlement_price=100,
        market_id=parent_market_id,
    )
    next_epoch(vega=vega)

    banner = page.get_by_test_id(market_banner)
    page.wait_for_selector('[data-testid="market-banner"]', state="attached")
    expect(banner.get_by_text("This market has been succeeded")).to_be_visible()

@pytest.mark.usefixtures("risk_accepted")
def test_banners(vega: VegaServiceNull, page: Page):

    banner_successor_text = "A successor to this market has been proposed"
    parent_market_id = setup_continuous_market(vega)
    tdai_id = vega.find_asset_id(symbol="tDAI")

    page.goto(f"/#/markets/{parent_market_id}")

    # market in normal state no banner shown
    expect(page.get_by_test_id(market_banner)).not_to_be_attached()

    vega.submit_termination_and_settlement_data(
    settlement_key=GOVERNANCE_WALLET.name,
    settlement_price=100,
    market_id=parent_market_id,
    )

    successor_name = "successor market name"
    propose_successor(vega, parent_market_id, tdai_id, successor_name)

    # Check that the banners notifying about the successor proposal and market has been settled are shown
    banner = page.get_by_test_id(market_banner)
    expect(banner).to_be_attached()
    expect(banner.get_by_text(banner_successor_text)).to_be_visible()
    expect(banner.get_by_text("1/2")).to_be_visible()

    # Check that the banner notifying about the successor proposal and market has been settled are shown still after reload
    page.reload()
    expect(banner.get_by_text(banner_successor_text)).to_be_visible()
    expect(banner.get_by_text("1/2")).to_be_visible() 
    # Check that the banner notifying about the successor proposal is not visible after close those banners
    banner.get_by_test_id("icon-cross").click()
    expect(banner.get_by_text("This market has been settled")).to_be_visible()
    expect(banner.get_by_text("2/2")).to_be_visible()

    # Check that the banners notifying are visible after reload
    banner.get_by_test_id("icon-cross").click()
    expect(page.get_by_test_id(market_banner)).not_to_be_attached()
    page.reload()
    expect(banner).to_be_attached()
    expect(banner.get_by_text(banner_successor_text)).to_be_visible() 

def propose_successor(
    vega: VegaServiceNull, parent_market_id, tdai_id, market_name
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
    vega: VegaServiceNull, market_id
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
