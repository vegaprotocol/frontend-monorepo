import pytest

from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from wallet_config import MM_WALLET
from conftest import init_vega, init_page, auth_setup, risk_accepted_setup
from actions.utils import next_epoch, change_keys, forward_time
from fixtures.market import setup_continuous_market

# region Constants for test IDs
ADJUSTED_FEES = "adjusted-fees"
TOTAL_FEE_BEFORE_DISCOUNT = "total-fee-before-discount"
INFRASTRUCTURE_FEES = "infrastructure-fees"
MAKER_FEES = "maker-fees"
LIQUIDITY_FEES = "liquidity-fees"
TOTAL_DISCOUNT = "total-discount"
VOLUME_DISCOUNT_ROW = "volume-discount-row"
REFERRAL_DISCOUNT_ROW = "referral-discount-row"
PAST_EPOCHS_VOLUME = "past-epochs-volume"
REQUIRED_FOR_NEXT_TIER = "required-for-next-tier"
TIER_VALUE_0 = "tier-value-0"
TIER_VALUE_1 = "tier-value-1"
DISCOUNT_VALUE_0 = "discount-value-0"
DISCOUNT_VALUE_1 = "discount-value-1"
MIN_VOLUME_VALUE_0 = "min-volume-value-0"
MIN_VOLUME_VALUE_1 = "min-volume-value-1"
MY_VOLUME_VALUE_0 = "my-volume-value-0"
MY_VOLUME_VALUE_1 = "my-volume-value-1"
ORDER_SIZE = "order-size"
ORDER_PRICE = "order-price"
DISCOUNT_PILL = "discount-pill"
FEES_TEXT = "fees-text"
TOOLTIP_CONTENT = "tooltip-content"
INFRASTRUCTURE_FEE_FACTOR = "infrastructure-fee-factor"
INFRASTRUCTURE_FEE_VALUE = "infrastructure-fee-value"
LIQUIDITY_FEE_FACTOR = "liquidity-fee-factor"
LIQUIDITY_FEE_VALUE = "liquidity-fee-value"
MAKER_FEE_FACTOR = "maker-fee-factor"
MAKER_FEE_VALUE = "maker-fee-value"
SUBTOTAL_FEE_FACTOR = "subtotal-fee-factor"
SUBTOTAL_FEE_VALUE = "subtotal-fee-value"
DISCOUNT_FEE_FACTOR = "discount-fee-factor"
DISCOUNT_FEE_VALUE = "discount-fee-value"
TOTAL_FEE_VALUE = "total-fee-value"
RUNNING_NOTIONAL_TAKER_VOLUME = "running-notional-taker-volume"
EPOCHS_IN_REFERRAL_SET = "epochs-in-referral-set"
REQUIRED_EPOCHS_VALUE_0 = "required-epochs-value-0"
REQUIRED_EPOCHS_VALUE_1 = "required-epochs-value-1"
FILLS = "Fills"
TAB_FILLS = "tab-fills"
FEE_BREAKDOWN_TOOLTIP = "fee-breakdown-tooltip"
PINNED_ROW_LOCATOR = ".ag-pinned-left-cols-container .ag-row"
ROW_LOCATOR = ".ag-center-cols-container .ag-row"
# Col-Ids:
COL_INSTRUMENT_CODE = '[data-testid="market-code"]'
COL_CODE = '[col-id="code"]'
COL_SIZE = '[col-id="size"]'
COL_PRICE = '[col-id="price"]'
COL_PRICE_1 = '[col-id="price_1"]'
COL_AGGRESSOR = '[col-id="aggressor"]'
COL_FEE = '[col-id="fee"]'
COL_FEE_DISCOUNT = '[col-id="fee-discount"]'
COL_FEE_AFTER_DISCOUNT = '[col-id="feeAfterDiscount"]'
COL_INFRA_FEE = '[col-id="infraFee"]'
COL_MAKER_FEE = '[col-id="makerFee"]'
COL_LIQUIDITY_FEE = '[col-id="liquidityFee"]'
COL_TOTAL_FEE = '[col-id="totalFee"]'
# endregion


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega


@pytest.fixture(scope="module")
def page(vega, browser, request):
    with init_page(vega, browser, request) as page:
        risk_accepted_setup(page)
        auth_setup(vega, page)
        yield page


@pytest.fixture(scope="module", autouse=True)
def setup_market_with_referral_discount_program(vega: VegaServiceNull):
    market = setup_continuous_market(vega, custom_quantum=100000)
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


@pytest.mark.xdist_group(name="test_fees_referral_tier_2")
def test_fees_page_discount_program_my_trading_fees(page: Page):
    page.goto("/#/fees")
    expect(page.get_by_test_id(ADJUSTED_FEES)).to_have_text("8.04%-8.04%")
    expect(page.get_by_test_id(TOTAL_FEE_BEFORE_DISCOUNT)).to_have_text(
        "Total fee before discount10.05%-10.05%"
    )
    expect(page.get_by_test_id(INFRASTRUCTURE_FEES)).to_have_text("Infrastructure0.05%")
    expect(page.get_by_test_id(MAKER_FEES)).to_have_text("Maker10%")
    expect(page.get_by_test_id(LIQUIDITY_FEES)).to_have_text("Liquidity0%-0%")


@pytest.mark.xdist_group(name="test_fees_referral_tier_2")
def test_fees_page_discount_program_total_discount(page: Page):
    page.goto("/#/fees")
    expect(page.get_by_test_id(TOTAL_DISCOUNT)).to_have_text("20%")
    expect(page.get_by_test_id(VOLUME_DISCOUNT_ROW)).to_have_text("Volume discount0%")
    expect(page.get_by_test_id(REFERRAL_DISCOUNT_ROW)).to_have_text(
        "Referral discount20%"
    )
    page.get_by_test_id(TOTAL_DISCOUNT).hover()
    expect(page.get_by_test_id(TOOLTIP_CONTENT).nth(0)).to_have_text(
        "The total discount is calculated according to the following formula: 1 - (1 - dvolume) ⋇ (1 - dreferral)"
    )


@pytest.mark.xdist_group(name="test_fees_referral_tier_2")
def test_fees_page_referral_discount_program_referral_benefits(page: Page):
    page.goto("/#/fees")
    expect(page.get_by_test_id(RUNNING_NOTIONAL_TAKER_VOLUME)).to_have_text("207")
    expect(page.get_by_test_id(REQUIRED_FOR_NEXT_TIER)).not_to_be_visible()


@pytest.mark.xdist_group(name="test_fees_referral_tier_2")
def test_fees_page_discount_program_discount(page: Page):
    page.goto("/#/fees")
    expect(page.get_by_test_id(TIER_VALUE_0)).to_have_text("1")
    expect(page.get_by_test_id(TIER_VALUE_1)).to_have_text("2")
    expect(page.get_by_test_id(DISCOUNT_VALUE_0)).to_have_text("10%")
    expect(page.get_by_test_id(DISCOUNT_VALUE_1)).to_have_text("20%")
    expect(page.get_by_test_id(MIN_VOLUME_VALUE_0)).to_have_text("100")
    expect(page.get_by_test_id(MIN_VOLUME_VALUE_1)).to_have_text("200")

    expect(page.get_by_test_id(REQUIRED_EPOCHS_VALUE_0)).to_have_text("1")
    expect(page.get_by_test_id(REQUIRED_EPOCHS_VALUE_1)).to_have_text("2")

    expect(page.get_by_test_id("your-referral-tier-1").nth(1)).to_be_visible()
    expect(page.get_by_test_id("your-referral-tier-1").nth(1)).to_have_text("Your tier")


@pytest.mark.xdist_group(name="test_fees_referral_tier_2")
def test_fees_page_discount_program_fees_by_market(page: Page):
    page.goto("/#/fees")
    pinned = page.locator(PINNED_ROW_LOCATOR)
    row = page.locator(ROW_LOCATOR)
    expect(pinned.locator(COL_CODE)).to_have_text("BTC:DAI_2023Futr")
    expect(row.locator(COL_FEE_AFTER_DISCOUNT)).to_have_text("8.04%")
    expect(row.locator(COL_INFRA_FEE)).to_have_text("0.05%")
    expect(row.locator(COL_MAKER_FEE)).to_have_text("10%")
    expect(row.locator(COL_LIQUIDITY_FEE)).to_have_text("0%")
    expect(row.locator(COL_TOTAL_FEE)).to_have_text("10.05%")


@pytest.mark.xdist_group(name="test_fees_referral_tier_2")
def test_deal_ticket_discount_program(
    page: Page, setup_market_with_referral_discount_program
):
    page.goto(f"/#/markets/{setup_market_with_referral_discount_program}")
    page.get_by_test_id(ORDER_SIZE).fill("1")
    page.get_by_test_id(ORDER_PRICE).fill("1")
    expect(page.get_by_test_id(DISCOUNT_PILL)).to_have_text("-20%")
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
    expect(tooltip.get_by_test_id(DISCOUNT_FEE_FACTOR)).to_have_text("-20%")
    expect(tooltip.get_by_test_id(DISCOUNT_FEE_VALUE)).to_have_text("-0.0201 tDAI")
    expect(tooltip.get_by_test_id(TOTAL_FEE_VALUE)).to_have_text("0.0804 tDAI")


@pytest.mark.xdist_group(name="test_fees_referral_tier_2")
def test_fills_taker_discount_program(
    page: Page,
    setup_market_with_referral_discount_program,
):
    page.goto(f"/#/markets/{setup_market_with_referral_discount_program}")
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    expect(row.locator(COL_SIZE)).to_have_text("+2")
    expect(row.locator(COL_PRICE)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_PRICE_1)).to_have_text("207.00 tDAI")
    expect(row.locator(COL_AGGRESSOR)).to_have_text("Taker")
    expect(row.locator(COL_FEE)).to_have_text("13.31424 tDAI")
    expect(row.locator(COL_FEE_DISCOUNT)).to_have_text("4.1607 tDAI")


@pytest.mark.xdist_group(name="test_fees_referral_tier_2")
def test_fills_maker_discount_program(
    vega: VegaServiceNull,
    page: Page,
    setup_market_with_referral_discount_program,
):
    page.goto(f"/#/markets/{setup_market_with_referral_discount_program}")
    change_keys(page, vega, MM_WALLET.name)
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    expect(row.locator(COL_SIZE)).to_have_text("-2")
    expect(row.locator(COL_PRICE)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_PRICE_1)).to_have_text("207.00 tDAI")
    expect(row.locator(COL_AGGRESSOR)).to_have_text("Maker")
    expect(row.locator(COL_FEE)).to_have_text("-13.248 tDAI")
    expect(row.locator(COL_FEE_DISCOUNT)).to_have_text("4.14 tDAI")


@pytest.mark.xdist_group(name="test_fees_referral_tier_2")
def test_fills_maker_fee_tooltip_discount_program(
    vega: VegaServiceNull, page: Page, setup_market_with_referral_discount_program
):
    page.goto(f"/#/markets/{setup_market_with_referral_discount_program}")
    change_keys(page, vega, MM_WALLET.name)
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    row.locator(COL_FEE).hover()
    expect(page.get_by_test_id(FEE_BREAKDOWN_TOOLTIP)).to_have_text(
        " If the market was activeFee revenue to be received by the maker, takers' fee discounts already applied.During continuous trading the maker pays no infrastructure and liquidity fees.Infrastructure fee0.00 tDAILiquidity fee0.00 tDAIMaker fee-13.248 tDAITotal fees-13.248 tDAI "
    )


@pytest.mark.xdist_group(name="test_fees_referral_tier_2")
def test_fills_taker_fee_tooltip_discount_program(
    page: Page,
    setup_market_with_referral_discount_program,
):
    page.goto(f"/#/markets/{setup_market_with_referral_discount_program}")
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    # tbd - tooltip is not visible without this wait
    page.wait_for_timeout(1000)
    row.locator(COL_FEE).hover()
    expect(page.get_by_test_id(FEE_BREAKDOWN_TOOLTIP)).to_have_text(
        "If the market was activeFee revenue to be received by the maker, takers' fee discounts already applied.During continuous trading the maker pays no infrastructure and liquidity fees.Infrastructure fee0.00 tDAILiquidity fee0.00 tDAIMaker fee-13.248 tDAITotal fees-13.248 tDAI "
    )
