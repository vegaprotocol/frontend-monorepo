import pytest
from typing import Tuple, Generator
from fees_test_ids import *
from playwright.sync_api import expect, Page
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
def setup_environment(
    request, browser
) -> Generator[Tuple[VegaServiceNull, str, Page], None, None]:
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        market = setup_continuous_market(vega_instance, custom_quantum=100000)
        vega_instance.update_volume_discount_program(
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
        next_epoch(vega_instance)

        vega_instance.update_referral_program(
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
        vega_instance.create_referral_set(key_name=MM_WALLET.name)
        next_epoch(vega_instance)
        referral_set_id = list(vega_instance.list_referral_sets().keys())[0]
        vega_instance.apply_referral_code(key_name="Key 1", id=referral_set_id)
        next_epoch(vega_instance)

        for _ in range(2):
            submit_order(vega_instance, "Key 1", market, "SIDE_BUY", 2, 110)
            forward_time(vega_instance, True if _ < 2 - 1 else False)

        with init_page(vega_instance, browser, request) as page_instance:
            risk_accepted_setup(page_instance)
            auth_setup(vega_instance, page_instance)
            yield vega_instance, market, page_instance


def test_fees_page_discount_program_my_trading_fees(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto("/#/fees")
    expect(page.get_by_test_id(ADJUSTED_FEES)).to_have_text("6.432%-6.432%")
    expect(page.get_by_test_id(TOTAL_FEE_BEFORE_DISCOUNT)).to_have_text(
        "Total fee before discount10.05%-10.05%"
    )
    expect(page.get_by_test_id(INFRASTRUCTURE_FEES)).to_have_text("Infrastructure0.05%")
    expect(page.get_by_test_id(MAKER_FEES)).to_have_text("Maker10%")
    expect(page.get_by_test_id(LIQUIDITY_FEES)).to_have_text("Liquidity0%-0%")


def test_fees_page_discount_program_total_discount(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
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


def test_fees_page_discount_program_fees_by_market(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto("/#/fees")
    pinned = page.locator(PINNED_ROW_LOCATOR)
    row = page.locator(ROW_LOCATOR)
    expect(pinned.locator(COL_CODE)).to_have_text("BTC:DAI_2023Futr")
    expect(row.locator(COL_FEE_AFTER_DISCOUNT)).to_have_text("6.432%")
    expect(row.locator(COL_INFRA_FEE)).to_have_text("0.05%")
    expect(row.locator(COL_MAKER_FEE)).to_have_text("10%")
    expect(row.locator(COL_LIQUIDITY_FEE)).to_have_text("0%")
    expect(row.locator(COL_TOTAL_FEE)).to_have_text("10.05%")


def test_deal_ticket_discount_program(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto(f"/#/markets/{market}")
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


def test_fills_taker_discount_program(setup_environment):
    vega, market, page = setup_environment
    page.goto(f"/#/markets/{market}")
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    expect(row.locator(COL_SIZE)).to_have_text("+2")
    expect(row.locator(COL_PRICE)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_PRICE_1)).to_have_text("207.00 tDAI")
    expect(row.locator(COL_AGGRESSOR)).to_have_text("Taker")
    expect(row.locator(COL_FEE)).to_have_text("10.6514 tDAI")
    expect(row.locator(COL_FEE_DISCOUNT)).to_have_text("7.48926 tDAI")


def test_fills_maker_discount_program(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto(f"/#/markets/{market}")
    change_keys(page, vega, MM_WALLET.name)
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    expect(row.locator(COL_SIZE)).to_have_text("-2")
    expect(row.locator(COL_PRICE)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_PRICE_1)).to_have_text("207.00 tDAI")
    expect(row.locator(COL_AGGRESSOR)).to_have_text("Maker")
    expect(row.locator(COL_FEE)).to_have_text("-10.5984 tDAI")
    expect(row.locator(COL_FEE_DISCOUNT)).to_have_text("7.452 tDAI")


def test_fills_maker_fee_tooltip_discount_program(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto(f"/#/markets/{market}")
    change_keys(page, vega, MM_WALLET.name)
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    row.locator(COL_FEE).hover()
    expect(page.get_by_test_id(FEE_BREAKDOWN_TOOLTIP)).to_have_text(
        "If the market was activeFee revenue to be received by the maker, takers' fee discounts already applied.During continuous trading the maker pays no infrastructure and liquidity fees.Infrastructure fee0.00 tDAILiquidity fee0.00 tDAIMaker fee-10.5984 tDAITotal fees-10.5984 tDAI"
    )


def test_fills_taker_fee_tooltip_discount_program(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto(f"/#/markets/{market}")
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    row.locator(COL_FEE).hover()
    expect(page.get_by_test_id(FEE_BREAKDOWN_TOOLTIP)).to_have_text(
        "If the market was activeFee revenue to be received by the maker, takers' fee discounts already applied.During continuous trading the maker pays no infrastructure and liquidity fees.Infrastructure fee0.00 tDAILiquidity fee0.00 tDAIMaker fee-10.5984 tDAITotal fees-10.5984 tDAI"
    )
