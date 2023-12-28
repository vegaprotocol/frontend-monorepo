import pytest

from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.vega import submit_order
from wallet_config import MM_WALLET
from conftest import init_vega, init_page, auth_setup
from actions.utils import next_epoch, change_keys, forward_time
from fixtures.market import market_exists, setup_continuous_market

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
YOUR_TIER_0 = "your-tier-0"
YOUR_TIER_1 = "your-tier-1"
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
ROW_LOCATOR = ".ag-center-cols-container .ag-row"
# Col-Ids:
COL_INSTRUMENT_CODE = '[col-id="market.tradableInstrument.instrument.code"]'
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
def market_ids():
    return {
        "tier_1_volume": "default_id",
        "tier_2_volume": "default_id",
        "tier_1_referral": "default_id",
        "tier_2_referral": "default_id",
        "combo": "default_id",
    }


@pytest.fixture(scope="module")
def vega_volume_discount_tier_1(request):
    with init_vega(request) as vega_volume_discount_tier_1:
        yield vega_volume_discount_tier_1


@pytest.fixture(scope="module")
def vega_volume_discount_tier_2(request):
    with init_vega(request) as vega_volume_discount_tier_2:
        yield vega_volume_discount_tier_2


@pytest.fixture(scope="module")
def vega_referral_discount_tier_1(request):
    with init_vega(request) as vega_referral_discount_tier_1:
        yield vega_referral_discount_tier_1


@pytest.fixture(scope="module")
def vega_referral_discount_tier_2(request):
    with init_vega(request) as vega_referral_discount_tier_2:
        yield vega_referral_discount_tier_2


@pytest.fixture(scope="module")
def vega_referral_and_volume_discount(request):
    with init_vega(request) as vega_referral_and_volume_discount:
        yield vega_referral_and_volume_discount


@pytest.fixture
def page(vega_instance, browser, request):
    with init_page(vega_instance, browser, request) as page_instance:
        yield page_instance


@pytest.fixture
def vega_instance(
    tier,
    discount_program,
    vega_volume_discount_tier_1,
    vega_volume_discount_tier_2,
    vega_referral_discount_tier_1,
    vega_referral_discount_tier_2,
    vega_referral_and_volume_discount,
):
    if discount_program == "volume":
        return vega_volume_discount_tier_1 if tier == 1 else vega_volume_discount_tier_2
    elif discount_program == "referral":
        return (
            vega_referral_discount_tier_1
            if tier == 1
            else vega_referral_discount_tier_2
        )
    elif discount_program == "combo":
        return vega_referral_and_volume_discount


@pytest.fixture
def auth(vega_instance, page):
    return auth_setup(vega_instance, page)


def setup_market_with_volume_discount_program(vega: VegaServiceNull, tier: int):
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

    order_count = 2 if tier == 1 else 3
    for _ in range(order_count):
        submit_order(vega, "Key 1", market, "SIDE_BUY", 1, 110)
        forward_time(vega, True if _ < order_count - 1 else False)

    return market


def setup_market_with_referral_discount_program(vega: VegaServiceNull, tier: int):
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

    order_count = 2
    order_size = 1 if tier == 1 else 2
    for _ in range(order_count):
        submit_order(vega, "Key 1", market, "SIDE_BUY", order_size, 110)
        forward_time(vega, True if _ < order_count - 1 else False)

    return market


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

    order_count = 2
    order_size = 2
    for _ in range(order_count):
        submit_order(vega, "Key 1", market, "SIDE_BUY", order_size, 110)
        forward_time(vega, True if _ < order_count - 1 else False)
    return market


def set_market_volume_discount(vega, tier, discount_program, market_ids):
    market_id_key = f"tier_{tier}_{discount_program}"
    if discount_program == "combo":
        market_id_key = "combo"

    market_id = market_ids.get(market_id_key, "default_id")

    print(f"Checking if market exists: {market_id}")
    if not market_exists(vega, market_id):
        print(
            f"Market doesn't exist for {discount_program} tier {tier}. Setting up new market."
        )

        if discount_program == "volume":
            market_id = setup_market_with_volume_discount_program(vega, tier)
        elif discount_program == "referral":
            market_id = setup_market_with_referral_discount_program(vega, tier)
        elif discount_program == "combo":
            market_id = setup_combined_market(vega)

        market_ids[market_id_key] = market_id

    print(f"Using market ID: {market_id}")
    return market_ids


@pytest.mark.parametrize(
    "tier, discount_program, expected_text",
    [
        (1, "volume", "9.045%-9.045%"),
        (2, "volume", "8.04%-8.04%"),
        (1, "referral", "9.045%-9.045%"),
        (2, "referral", "8.04%-8.04%"),
        (2, "combo", "6.432%-6.432%"),
    ],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_fees_page_discount_program_my_trading_fees(
    tier, expected_text, discount_program, vega_instance, page: Page, market_ids
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )

    page.goto("/#/fees")
    expect(page.get_by_test_id(ADJUSTED_FEES)).to_have_text(expected_text)
    expect(page.get_by_test_id(TOTAL_FEE_BEFORE_DISCOUNT)).to_have_text(
        "Total fee before discount10.05%-10.05%"
    )
    expect(page.get_by_test_id(INFRASTRUCTURE_FEES)).to_have_text("Infrastructure0.05%")
    expect(page.get_by_test_id(MAKER_FEES)).to_have_text("Maker10%")
    expect(page.get_by_test_id(LIQUIDITY_FEES)).to_have_text("Liquidity0%-0%")


@pytest.mark.parametrize(
    "tier, discount_program, volume_discount, total_discount, referral_discount",
    [
        (1, "volume", "Volume discount10%", "10%", "Referral discount0%"),
        (2, "volume", "Volume discount20%", "20%", "Referral discount0%"),
        (1, "referral", "Volume discount0%", "10%", "Referral discount10%"),
        (2, "referral", "Volume discount0%", "20%", "Referral discount20%"),
        (2, "combo", "Volume discount20%", "36%", "Referral discount20%"),
    ],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_fees_page_discount_program_total_discount(
    tier,
    discount_program,
    volume_discount,
    referral_discount,
    total_discount,
    vega_instance,
    page: Page,
    market_ids,
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )
    page.goto("/#/fees")
    expect(page.get_by_test_id(TOTAL_DISCOUNT)).to_have_text(total_discount)
    expect(page.get_by_test_id(VOLUME_DISCOUNT_ROW)).to_have_text(volume_discount)
    expect(page.get_by_test_id(REFERRAL_DISCOUNT_ROW)).to_have_text(referral_discount)
    page.get_by_test_id(TOTAL_DISCOUNT).hover()
    expect(page.get_by_test_id(TOOLTIP_CONTENT).nth(0)).to_have_text(
        "The total discount is calculated according to the following formula: 1 - (1 - dvolume) ⋇ (1 - dreferral)"
    )


@pytest.mark.parametrize(
    "tier, discount_program, past_epochs_volume, required_for_next_tier",
    [(1, "volume", "103", "97"), (2, "volume", "206", "")],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_fees_page_volume_discount_program_my_current_volume(
    tier,
    discount_program,
    past_epochs_volume,
    required_for_next_tier,
    vega_instance,
    page: Page,
    market_ids,
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )
    page.goto("/#/fees")
    expect(page.get_by_test_id(PAST_EPOCHS_VOLUME)).to_have_text(past_epochs_volume)

    if tier == 1:
        expect(page.get_by_test_id(REQUIRED_FOR_NEXT_TIER)).to_have_text(
            required_for_next_tier
        )
    else:
        expect(page.get_by_test_id(REQUIRED_FOR_NEXT_TIER)).not_to_be_visible()


@pytest.mark.parametrize(
    "tier, discount_program, notional_taker_volume, epochs_in_set",
    [(1, "referral", "103", "1"), (2, "referral", "207", "1")],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_fees_page_referral_discount_program_referral_benefits(
    tier,
    vega_instance,
    discount_program,
    notional_taker_volume,
    epochs_in_set,
    page: Page,
    market_ids,
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )
    page.goto("/#/fees")
    expect(page.get_by_test_id(RUNNING_NOTIONAL_TAKER_VOLUME)).to_have_text(
        notional_taker_volume
    )
    expect(page.get_by_test_id(EPOCHS_IN_REFERRAL_SET)).to_have_text(epochs_in_set)


@pytest.mark.parametrize(
    "tier, discount_program, my_volume_test_id, my_volume_value, your_tier",
    [
        (1, "volume", "my-volume-value-0", "103", "your-tier-0"),
        (2, "volume", "my-volume-value-1", "206", "your-tier-1"),
        (1, "referral", "my-volume-value-0", "103", "your-tier-0"),
        (2, "referral", "my-volume-value-1", "206", "your-tier-1"),
    ],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_fees_page_discount_program_discount(
    tier,
    discount_program,
    my_volume_test_id,
    my_volume_value,
    your_tier,
    vega_instance,
    page: Page,
    market_ids,
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )
    page.goto("/#/fees")
    expect(page.get_by_test_id(TIER_VALUE_0)).to_have_text("1")
    expect(page.get_by_test_id(TIER_VALUE_1)).to_have_text("2")
    expect(page.get_by_test_id(DISCOUNT_VALUE_0)).to_have_text("10%")
    expect(page.get_by_test_id(DISCOUNT_VALUE_1)).to_have_text("20%")
    expect(page.get_by_test_id(MIN_VOLUME_VALUE_0)).to_have_text("100")
    expect(page.get_by_test_id(MIN_VOLUME_VALUE_1)).to_have_text("200")

    if discount_program == "volume":
        expect(page.get_by_test_id(my_volume_test_id)).to_have_text(my_volume_value)
    else:
        expect(page.get_by_test_id(REQUIRED_EPOCHS_VALUE_0)).to_have_text("1")
        expect(page.get_by_test_id(REQUIRED_EPOCHS_VALUE_1)).to_have_text("2")

    expect(page.get_by_test_id(your_tier)).to_be_visible()
    expect(page.get_by_test_id(your_tier)).to_have_text("Your tier")


@pytest.mark.parametrize(
    "tier, discount_program, fees_after_discount",
    [
        (1, "volume", "9.045%"),
        (2, "volume", "8.04%"),
        (1, "referral", "9.045%"),
        (2, "referral", "8.04%"),
        (2, "combo", "6.432%"),
    ],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_fees_page_discount_program_fees_by_market(
    tier, discount_program, fees_after_discount, vega_instance, page: Page, market_ids
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )
    page.goto("/#/fees")
    row = page.locator(ROW_LOCATOR)
    expect(row.locator(COL_CODE)).to_have_text("BTC:DAI_2023Futr")
    expect(row.locator(COL_FEE_AFTER_DISCOUNT)).to_have_text(fees_after_discount)
    expect(row.locator(COL_INFRA_FEE)).to_have_text("0.05%")
    expect(row.locator(COL_MAKER_FEE)).to_have_text("10%")
    expect(row.locator(COL_LIQUIDITY_FEE)).to_have_text("0%")
    expect(row.locator(COL_TOTAL_FEE)).to_have_text("10.05%")


@pytest.mark.parametrize(
    "tier, discount_program, discount, discount_value, total_fee",
    [
        (1, "volume", "-10%", "-0.01005 tDAI", "0.09045 tDAI"),
        (2, "volume", "-20%", "-0.0201 tDAI", "0.0804 tDAI"),
        (1, "referral", "-10%", "-0.01005 tDAI", "0.09045 tDAI"),
        (2, "referral", "-20%", "-0.0201 tDAI", "0.0804 tDAI"),
        (2, "combo", "-36%", "-0.03618 tDAI", "0.06432 tDAI"),
    ],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_deal_ticket_discount_program(
    tier,
    discount_program,
    discount,
    discount_value,
    total_fee,
    vega_instance,
    page: Page,
    market_ids,
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )
    market_id_key = f"tier_{tier}_{discount_program}"
    if discount_program == "combo":
        market_id_key = "combo"
    market_id = market_ids.get(market_id_key)
    page.goto(f"/#/markets/{market_id}")
    page.get_by_test_id(ORDER_SIZE).fill("1")
    page.get_by_test_id(ORDER_PRICE).fill("1")
    expect(page.get_by_test_id(DISCOUNT_PILL)).to_have_text(discount)
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
    expect(tooltip.get_by_test_id(DISCOUNT_FEE_FACTOR)).to_have_text(discount)
    expect(tooltip.get_by_test_id(DISCOUNT_FEE_VALUE)).to_have_text(discount_value)
    expect(tooltip.get_by_test_id(TOTAL_FEE_VALUE)).to_have_text(total_fee)


@pytest.mark.parametrize(
    "tier, discount_program, fee, fee_discount, price_1, size",
    [
        (1, "volume", "9.36158 tDAI", "1.04017 tDAI", "103.50 tDAI", "+1"),
        (2, "volume", "8.3214 tDAI", "2.08035 tDAI", "103.50 tDAI", "+1"),
        (
            1,
            "referral",
            "8.42543 tDAI ",
            "1.04017 tDAI",
            "103.50 tDAI",
            "+1",
        ),
        (
            2,
            "referral",
            "13.31424 tDAI",
            "4.1607 tDAI",
            "207.00 tDAI",
            "+2",
        ),
        (2, "combo", "10.6514 tDAI ", "7.48926 tDAI", "207.00 tDAI", "+2"),
    ],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_fills_taker_discount_program(
    tier,
    discount_program,
    fee,
    fee_discount,
    price_1,
    size,
    vega_instance,
    page: Page,
    market_ids,
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )
    market_id_key = f"tier_{tier}_{discount_program}"
    if discount_program == "combo":
        market_id_key = "combo"
    market_id = market_ids.get(market_id_key)
    page.goto(f"/#/markets/{market_id}")
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    expect(row.locator(COL_INSTRUMENT_CODE)).to_have_text("BTC:DAI_2023Futr")
    expect(row.locator(COL_SIZE)).to_have_text(size)
    expect(row.locator(COL_PRICE)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_PRICE_1)).to_have_text(price_1)
    expect(row.locator(COL_AGGRESSOR)).to_have_text("Taker")
    expect(row.locator(COL_FEE)).to_have_text(fee)
    expect(row.locator(COL_FEE_DISCOUNT)).to_have_text(fee_discount)


@pytest.mark.parametrize(
    "tier, discount_program, fee, fee_discount, size, price_1",
    [
        (1, "volume", "-9.315 tDAI", "1.035 tDAI", "-1", "103.50 tDAI"),
        (2, "volume", "-8.28 tDAI", "2.07 tDAI", "-1", "103.50 tDAI"),
        (1, "referral", "-8.3835 tDAI", "1.035 tDAI", "-1", "103.50 tDAI"),
        (2, "referral", "-13.248 tDAI", "4.14 tDAI", "-2", "207.00 tDAI"),
        (2, "combo", "-10.5984 tDAI ", "7.452 tDAI", "-2", "207.00 tDAI"),
    ],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_fills_maker_discount_program(
    tier,
    discount_program,
    vega_instance,
    fee,
    fee_discount,
    size,
    price_1,
    page: Page,
    market_ids,
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )
    market_id_key = f"tier_{tier}_{discount_program}"
    if discount_program == "combo":
        market_id_key = "combo"
    market_id = market_ids.get(market_id_key)
    page.goto(f"/#/markets/{market_id}")
    change_keys(page, vega_instance, MM_WALLET.name)
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    expect(row.locator(COL_INSTRUMENT_CODE)).to_have_text("BTC:DAI_2023Futr")
    expect(row.locator(COL_SIZE)).to_have_text(size)
    expect(row.locator(COL_PRICE)).to_have_text("103.50 tDAI")
    expect(row.locator(COL_PRICE_1)).to_have_text(price_1)
    expect(row.locator(COL_AGGRESSOR)).to_have_text("Maker")
    expect(row.locator(COL_FEE)).to_have_text(fee)
    expect(row.locator(COL_FEE_DISCOUNT)).to_have_text(fee_discount)


@pytest.mark.parametrize(
    "tier, discount_program, fee",
    [
        (1, "volume", "9.315"),
        (2, "volume", "8.28"),
        (1, "referral", "8.3835"),
        (2, "referral", "13.248"),
        (2, "combo", "10.5984"),
    ],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_fills_maker_fee_tooltip_discount_program(
    tier, discount_program, fee, vega_instance, page: Page, market_ids
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )
    market_id_key = f"tier_{tier}_{discount_program}"
    if discount_program == "combo":
        market_id_key = "combo"
    market_id = market_ids.get(market_id_key)
    page.goto(f"/#/markets/{market_id}")
    change_keys(page, vega_instance, MM_WALLET.name)
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    page.wait_for_timeout(200)
    row.locator(COL_FEE).hover()
    expect(page.get_by_test_id(FEE_BREAKDOWN_TOOLTIP)).to_have_text(
        f"If the market was activeFee revenue to be received by the maker, takers' fee discounts already applied.During continuous trading the maker pays no infrastructure and liquidity fees.Infrastructure fee0.00 tDAILiquidity fee0.00 tDAIMaker fee-{fee} tDAITotal fees-{fee} tDAI"
    )


@pytest.mark.parametrize(
    "tier, discount_program, maker_fee, total_fee, infra_fee",
    [
        (1, "volume", "9.315", "9.36158", "0.04658"),
        (2, "volume", "8.28", "8.3214", "0.0414"),
        (1, "referral", "8.3835", "8.42543", "0.04193"),
        (2, "referral", "13.248", "13.31424", "0.06624"),
        (2, "combo", "10.5984", "10.6514", "0.053"),
    ],
)
@pytest.mark.usefixtures("risk_accepted", "auth", "market_ids")
def test_fills_taker_fee_tooltip_discount_program(
    tier,
    discount_program,
    vega_instance,
    maker_fee,
    total_fee,
    infra_fee,
    page: Page,
    market_ids,
):
    market_ids = set_market_volume_discount(
        vega_instance, tier, discount_program, market_ids
    )
    market_id_key = f"tier_{tier}_{discount_program}"
    if discount_program == "combo":
        market_id_key = "combo"
    market_id = market_ids.get(market_id_key)
    page.goto(f"/#/markets/{market_id}")
    page.get_by_test_id(FILLS).click()
    row = page.get_by_test_id(TAB_FILLS).locator(ROW_LOCATOR).first
    page.wait_for_timeout(200)
    row.locator(COL_FEE).hover()
    expect(page.get_by_test_id(FEE_BREAKDOWN_TOOLTIP)).to_have_text(
        f"If the market was activeFees to be paid by the taker; discounts are already applied.Infrastructure fee{infra_fee} tDAILiquidity fee0.00 tDAIMaker fee{maker_fee} tDAITotal fees{total_fee} tDAI"
    )
