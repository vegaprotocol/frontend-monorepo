import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.utils import change_keys
from conftest import init_vega, cleanup_container
from fixtures.market import setup_continuous_market

order_size = "order-size"
order_price = "order-price"
place_order = "place-order"
no_collateral_warning = "feedback-not-enough-collateral"
not_enough_collateral_warning = "feedback-not-enough-collateral"
deposit_button = "feedback-deposit-button"


@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega_instance:
        request.addfinalizer(lambda: cleanup_container(vega_instance))
        yield vega_instance


@pytest.fixture(scope="module")
def continuous_market(vega):
    return setup_continuous_market(vega)


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_should_display_info_and_button_for_deposit(continuous_market, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.pause()
    page.get_by_test_id(order_size).fill("200000")
    page.get_by_test_id(order_price).fill("20")
    # 7002-SORD-060
    expect(page.get_by_test_id(not_enough_collateral_warning)).to_have_text(
        "You may not have enough margin available to open this position."
    )
    page.get_by_test_id(not_enough_collateral_warning).hover()
    expect(page.get_by_test_id("tooltip-content").nth(0)).to_have_text(
        "1661888.12901 tDAI is currently required.You have only 999991.49731."
    )
    page.get_by_test_id(deposit_button).click()
    expect(page.get_by_test_id("deposit-form")).to_be_visible()


@pytest.mark.usefixtures("auth", "risk_accepted")
def test_should_show_an_error_if_your_balance_is_zero(
    continuous_market, vega: VegaServiceNull, page: Page
):
    page.goto(f"/#/markets/{continuous_market}")
    vega.create_key("key_empty")
    change_keys(page, vega, "key_empty")
    page.get_by_test_id(order_size).fill("200")
    page.get_by_test_id(order_price).fill("20")
    # 7002-SORD-060
    expect(page.get_by_test_id(place_order)).to_be_enabled()
    # 7002-SORD-003
    expect(page.get_by_test_id("feedback-no-collateral")).to_have_text(
        "You need tDAI in your wallet to trade in this market Deposit tDAI"
    )
    expect(page.get_by_test_id(deposit_button)).to_be_visible()
