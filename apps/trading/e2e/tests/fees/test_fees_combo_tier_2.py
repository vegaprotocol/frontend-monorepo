import pytest
from fees_test_ids import *
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from wallet_config import MM_WALLET
from conftest import (
    init_vega,
    init_page,
    auth_setup,
    risk_accepted_setup,
    cleanup_container,
)
from actions.utils import next_epoch, change_keys, forward_time
from fixtures.market import setup_continuous_market


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(
            lambda: cleanup_container(vega_instance)
        )
        yield vega_instance


@pytest.fixture(scope="module")
def page(vega, browser, request):
    with init_page(vega, browser, request) as page:
        risk_accepted_setup(page)
        auth_setup(vega, page)
        yield page


@pytest.fixture(scope="module", autouse=True)
def setup_combined_market(vega: VegaServiceNull):
    market = setup_continuous_market(vega, custom_quantum=100000)
    vega.update_volume_discount_program(
        proposal_key=MM_WALLET.name,
        benefit_tiers=[
            {
                "minimum_running_notional_taker_volume": 100,
                "volume_discount_factor": 0.1,
            },
            {
                "minimum_running_notional_taker_volume": 200,
                "volume_discount_factor": 0.2,
            },
        ],
        window_length=7,
    )
    next_epoch(vega=vega)

    vega.update_referral_program(
        proposal_key=MM_WALLET.name,
        benefit_tiers=[
            {
                "minimum_running_notional_taker_volume": 100,
                "minimum_epochs": 1,
                "referral_reward_factor": 0.1,
                "referral_discount_factor": 0.1,
            },
            {
                "minimum_running_notional_taker_volume": 200,
                "minimum_epochs": 2,
                "referral_reward_factor": 0.2,
                "referral_discount_factor": 0.2,
            },
        ],
        staking_tiers=[
            {"minimum_staked_tokens": 100, "referral_reward_multiplier": 1.1},
            {"minimum_staked_tokens": 200, "referral_reward_multiplier": 1.2},
        ],
        window_length=1,
    )
    vega.create_referral_set(key_name=MM_WALLET.name)
    next_epoch(vega=vega)
    referral_set_id = list(vega.list_referral_sets().keys())[0]
    vega.apply_referral_code(key_name="Key 1", id=referral_set_id)
    next_epoch(vega=vega)

    for _ in range(2):
        submit_order(vega, "Key 1", market, "SIDE_BUY", 2, 110)
        forward_time(vega, True if _ < 2 - 1 else False)
    return market


@pytest.mark.xdist_group(name="test_fees_combo_tier_2")
def test_fees_page_discount_program_my_trading_fees(page: Page):
    page.goto("/#/fees")
    expect(page.get_by_test_id(ADJUSTED_FEES)).to_have_text("6.432%-6.432%")
    expect(page.get_by_test_id(TOTAL_FEE_BEFORE_DISCOUNT)).to_have_text(
        "Total fee before discount10.05%-10.05%"
    )
    expect(page.get_by_test_id(INFRASTRUCTURE_FEES)).to_have_text("Infrastructure0.05%")
    expect(page.get_by_test_id(MAKER_FEES)).to_have_text("Maker10%")
    expect(page.get_by_test_id(LIQUIDITY_FEES)).to_have_text("Liquidity0%-0%")


@pytest.mark.xdist_group(name="test_fees_combo_tier_2")
def test_fees_page_discount_program_total_discount(
    page: Page,
):
    page.goto("/#/fees")
    expect(page.get_by_test_id(TOTAL_DISCOUNT)).to_have_text("36%")
    expect(page.get_by_test_id(VOLUME_DISCOUNT_ROW)).to_have_text("Volume discount20%")
    expect(page.get_by_test_id(REFERRAL_DISCOUNT_ROW)).to_have_text(
        "Referral discount20%"
    )
    page.get_by_test_id(TOTAL_DISCOUNT).hover()
    expect(page.get_by_test_id(TOOLTIP_CONTENT).nth(0)).to_have_text(
        "The total discount is calculated according to the following formula: 1 - (1 - dvolume) ⋇ (1 - dreferral)"
    )


@pytest.mark.xdist_group(name="test_fees_combo_tier_2")
def test_fees_page_discount_program_fees_by_market(page: Page):
    page.goto("/#/fees")
    pinned = page.locator(PINNED_ROW_LOCATOR)
    row = page.locator(ROW_LOCATOR)
    expect(pinned.locator(COL_CODE)).to_have_text("BTC:DAI_2023Futr")
    expect(row.locator(COL_FEE_AFTER_DISCOUNT)).to_have_text("6.432%")
    expect(row.locator(COL_INFRA_FEE)).to_have_text("0.05%")
    expect(row.locator(COL_MAKER_FEE)).to_have_text("10%")
    expect(row.locator(COL_LIQUIDITY_FEE)).to_have_text("0%")
    expect(row.locator(COL_TOTAL_FEE)).to_have_text("10.05%")


@pytest.mark.xdist_group(name="test_fees_combo_tier_2")
def test_deal_ticket_discount_program(
    page: Page,
    setup_combined_market,
):
    page.goto(f"/#/markets/{setup_combined_market}")
    page.get_by_test_id(ORDER_SIZE).fill("1")
    page.get_by_test_id(ORDER_PRICE).fill("1")
    expect(page.get_by_test_id(DISCOUNT_PILL)).to_have_text("-36%")
    page.get_by_test_id(FEES_TEXT).hover()
    tooltip = page.get_by_test_id(TOOLTIP_CONTENT).first
    expect(tooltip.get_by_test_id(INFRASTRUCTURE_FEE_FACTOR)).to_have_text("0.05%")
    expect(tooltip.get_by_test_id(INFRASTRUCTURE_FEE_VALUE)).to_have_text("0.0005 tDAI")
    expect(tooltip.get_by_test_id(LIQUIDITY_FEE_FACTOR)).to_have_text("0%")
    expect(tooltip.get_by_test_id(LIQUIDITY_FEE_VALUE)).to_have_text("0.00 tDAI")
    expect(tooltip.get_by_test_id(MAKER_FEE_FACTOR)).to_have_text("10%")
    expect(tooltip.get_by_test_id(MAKER_FEE_VALUE)).to_have_text("0.10 tDAI")
    expect(tooltip.get_by_test_id(SUBTOTAL_FEE_FACTOR)).to_have_text("10.05%")
    expect(tooltip.get_by_test_id(SUBTOTAL_FEE_VALUE)).to_have_text("0.1005 tDAI")
    expect(tooltip.get_by_test_id(DISCOUNT_FEE_FACTOR)).to_have_text("-36%")
    expect(tooltip.get_by_test_id(DISCOUNT_FEE_VALUE)).to_have_text("-0.03618 tDAI")
    expect(tooltip.get_by_test_id(TOTAL_FEE_VALUE)).to_have_text("0.06432 tDAI")


@pytest.mark.xdist_group(name="test_fees_combo_tier_2")
def test_fills_taker_discount_program(
    page: Page,
    setup_combined_market,
):
    page.goto(f"/#/markets/{setup_combined_market}")
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    expect(row.locator(COL_SIZE)).to_have_text("+2")
    expect(row.locator(COL_PRICE)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_PRICE_1)).to_have_text("207.00 tDAI")
    expect(row.locator(COL_AGGRESSOR)).to_have_text("Taker")
    expect(row.locator(COL_FEE)).to_have_text("10.6514 tDAI")
    expect(row.locator(COL_FEE_DISCOUNT)).to_have_text("7.48926 tDAI")


@pytest.mark.xdist_group(name="test_fees_combo_tier_2")
def test_fills_maker_discount_program(
    vega: VegaServiceNull,
    page: Page,
    setup_combined_market,
):
    page.goto(f"/#/markets/{setup_combined_market}")
    change_keys(page, vega, MM_WALLET.name)
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    expect(row.locator(COL_SIZE)).to_have_text("-2")
    expect(row.locator(COL_PRICE)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_PRICE_1)).to_have_text("207.00 tDAI")
    expect(row.locator(COL_AGGRESSOR)).to_have_text("Maker")
    expect(row.locator(COL_FEE)).to_have_text("-10.5984 tDAI")
    expect(row.locator(COL_FEE_DISCOUNT)).to_have_text("7.452 tDAI")


@pytest.mark.xdist_group(name="test_fees_combo_tier_2")
def test_fills_maker_fee_tooltip_discount_program(
    vega: VegaServiceNull, page: Page, setup_combined_market
):
    page.goto(f"/#/markets/{setup_combined_market}")
    change_keys(page, vega, MM_WALLET.name)
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    row.locator(COL_FEE).hover()
    expect(page.get_by_test_id(FEE_BREAKDOWN_TOOLTIP)).to_have_text(
        "If the market was activeFee revenue to be received by the maker, takers' fee discounts already applied.During continuous trading the maker pays no infrastructure and liquidity fees.Infrastructure fee0.00 tDAILiquidity fee0.00 tDAIMaker fee-10.5984 tDAITotal fees-10.5984 tDAI"
    )


@pytest.mark.xdist_group(name="test_fees_combo_tier_2")
def test_fills_taker_fee_tooltip_discount_program(
    page: Page,
    setup_combined_market,
):
    page.goto(f"/#/markets/{setup_combined_market}")
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    row.locator(COL_FEE).hover()
    expect(page.get_by_test_id(FEE_BREAKDOWN_TOOLTIP)).to_have_text(
        "If the market was activeFee revenue to be received by the maker, takers' fee discounts already applied.During continuous trading the maker pays no infrastructure and liquidity fees.Infrastructure fee0.00 tDAILiquidity fee0.00 tDAIMaker fee-10.5984 tDAITotal fees-10.5984 tDAI"
    )
