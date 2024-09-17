import pytest
from fees_test_ids import *
from typing import Tuple, Generator
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
def setup_environment(
    request, browser
) -> Generator[Tuple[VegaServiceNull, str, Page], None, None]:
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))

        # Setup the market with volume discount program
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
        next_epoch(vega=vega_instance)

        for _ in range(3):
            submit_order(vega_instance, "Key 1", market, "SIDE_BUY", 1, 110)
            forward_time(vega_instance, True if _ < 3 - 1 else False)

        # Initialize page and apply setups
        with init_page(vega_instance, browser, request) as page_instance:
            risk_accepted_setup(page_instance)
            auth_setup(vega_instance, page_instance)
            yield vega_instance, market, page_instance


def test_fees_page_discount_program_my_trading_fees(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto("/#/fees")
    expect(page.get_by_test_id(ADJUSTED_FEES)).to_have_text("8.04%-8.04%")
    expect(page.get_by_test_id(TOTAL_FEE_BEFORE_DISCOUNT)).to_have_text(
        "Taker fee before discount10.05%-10.05%"
    )
    expect(page.get_by_test_id(INFRASTRUCTURE_FEES)).to_have_text("Infrastructure0.05%")
    expect(page.get_by_test_id(MAKER_FEES)).to_have_text("Maker10%")
    expect(page.get_by_test_id(LIQUIDITY_FEES)).to_have_text("Liquidity0%-0%")


def test_fees_page_discount_program_total_discount(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto("/#/fees")
    expect(page.get_by_test_id(TOTAL_DISCOUNT)).to_have_text("20%")
    expect(page.get_by_test_id(VOLUME_DISCOUNT_ROW)).to_have_text("Volume discount20%")
    expect(page.get_by_test_id(REFERRAL_DISCOUNT_ROW)).to_have_text(
        "Referral discount0%"
    )
    page.get_by_test_id(TOTAL_DISCOUNT).hover()
    expect(page.get_by_test_id(TOOLTIP_CONTENT).nth(0)).to_have_text(
        "The total discount is calculated according to the following formula: 1 - (1 - dvolume) ⋇ (1 - dreferral)"
    )


def test_fees_page_volume_discount_program_my_current_volume(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto("/#/fees")
    expect(page.get_by_test_id(PAST_EPOCHS_VOLUME)).to_have_text("206")
    expect(page.get_by_test_id(REQUIRED_FOR_NEXT_TIER)).not_to_be_visible()


def test_fees_page_discount_program_discount(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto("/#/fees")
    expect(page.get_by_test_id(TIER_VALUE_0)).to_have_text("1")
    expect(page.get_by_test_id(TIER_VALUE_1)).to_have_text("2")
    expect(page.get_by_test_id(DISCOUNT_VALUE_0)).to_have_text("10%")
    expect(page.get_by_test_id(DISCOUNT_VALUE_1)).to_have_text("20%")
    expect(page.get_by_test_id(MIN_VOLUME_VALUE_0)).to_have_text("100")
    expect(page.get_by_test_id(MIN_VOLUME_VALUE_1)).to_have_text("200")
    expect(page.get_by_test_id("my-volume-value-1")).to_have_text("206")
    expect(page.get_by_test_id("your-volume-tier-1").nth(1)).to_be_visible()
    expect(page.get_by_test_id("your-volume-tier-1").nth(1)).to_have_text("Your tier")


def test_fees_page_discount_program_fees_by_market(setup_environment):
    vega, market, page = setup_environment
    page.goto("/#/fees")
    pinned = page.locator(PINNED_ROW_LOCATOR)
    row = page.locator(ROW_LOCATOR)
    expect(pinned.locator(COL_CODE)).to_have_text("BTC:DAI_2023FutrBTC:DAI_2023 ")
    expect(row.locator(COL_FEE_AFTER_DISCOUNT)).to_have_text("8.04%")
    expect(row.locator(COL_INFRA_FEE)).to_have_text("0.05%")
    expect(row.locator(COL_MAKER_FEE)).to_have_text("10%")
    expect(row.locator(COL_LIQUIDITY_FEE)).to_have_text("0%")
    expect(row.locator(COL_TOTAL_FEE)).to_have_text("10.05%")


def test_fills_taker_discount_program(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto(f"/#/markets/{market}")
    page.get_by_test_id(TRADES).nth(1).click()
    row = page.locator(ROW_LOCATOR).first
    expect(row.locator(COL_SIZE)).to_have_text("+1")
    expect(row.locator(COL_PRICE)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_PRICE_1)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_AGGRESSOR)).to_have_text("Taker")
    expect(row.locator(COL_FEE)).to_have_text(
        "8.3214 tDAI",
    )
    expect(row.locator(COL_FEE_DISCOUNT)).to_have_text("2.08035 tDAI")


def test_fills_maker_discount_program(
    setup_environment: Tuple[VegaServiceNull, str, Page],
) -> None:
    vega, market, page = setup_environment
    page.goto(f"/#/markets/{market}")
    change_keys(page, vega, MM_WALLET.name)
    page.get_by_test_id(TRADES).nth(1).click()
    row = page.locator(ROW_LOCATOR).first
    expect(row.locator(COL_SIZE)).to_have_text("-1")
    expect(row.locator(COL_PRICE)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_PRICE_1)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_AGGRESSOR)).to_have_text("Maker")
    expect(row.locator(COL_FEE)).to_have_text("-8.28 tDAI ")
    expect(row.locator(COL_FEE_DISCOUNT)).to_have_text("2.07 tDAI")
