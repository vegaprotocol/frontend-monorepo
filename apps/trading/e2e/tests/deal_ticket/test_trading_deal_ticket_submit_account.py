import pytest
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.utils import change_keys
from conftest import init_vega, cleanup_container
from fixtures.market import setup_continuous_market

order_size = "order-size"
order_price = "order-price"
place_order = "place-order"
deal_ticket_warning_margin = "deal-ticket-warning-margin"
deal_ticket_deposit_dialog_button = "deal-ticket-deposit-dialog-button"


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
    page.get_by_test_id(order_size).fill("200000")
    page.get_by_test_id(order_price).fill("20")
    # 7002-SORD-060
    expect(page.get_by_test_id(deal_ticket_warning_margin)).to_have_text(
        "You may not have enough margin available to open this position."
    )
    page.get_by_test_id(deal_ticket_warning_margin).hover()
    expect(page.get_by_test_id("tooltip-content").nth(0)).to_have_text(
        "1,661,888.12901 tDAI is currently required.You have only 999,991.49731.Deposit tDAI"
    )
    page.get_by_test_id(deal_ticket_deposit_dialog_button).nth(0).click()
    expect(page.get_by_test_id("deposit-form")
           ).to_be_visible()


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
    expect(page.get_by_test_id("deal-ticket-error-message-zero-balance")).to_have_text(
        "You need tDAI in your wallet to trade in this market.Make a deposit"
    )
    expect(page.get_by_test_id(deal_ticket_deposit_dialog_button)).to_be_visible()
