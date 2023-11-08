import pytest
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from actions.utils import wait_for_toast_confirmation
from conftest import init_vega
from fixtures.market import setup_continuous_market



order_size = "order-size"
order_price = "order-price"
place_order = "place-order"
deal_ticket_warning_margin = "deal-ticket-warning-margin"
deal_ticket_deposit_dialog_button = "deal-ticket-deposit-dialog-button"

@pytest.fixture(scope="module")
def vega(request):
    with init_vega(request) as vega:
        yield vega


@pytest.fixture(scope="module")
def continuous_market(vega):
    return setup_continuous_market(vega)

@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_should_display_info_and_button_for_deposit(continuous_market, vega: VegaService, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    page.get_by_test_id(order_size).fill("200000")
    page.get_by_test_id(order_price).fill("20")
    # 7002-SORD-060
    expect(page.get_by_test_id(deal_ticket_warning_margin)).to_have_text("You may not have enough margin available to open this position.")
    page.get_by_test_id(deal_ticket_warning_margin).hover()
    expect(page.get_by_test_id("tooltip-content").nth(0)).to_have_text("1,661,896.6317 tDAI is currently required.You have only 1,000,000.00.Deposit tDAI")
    page.get_by_test_id(deal_ticket_deposit_dialog_button).nth(0).click()
    expect(page.get_by_test_id("sidebar-content")).to_contain_text("DepositFrom")
    
@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_should_show_an_error_if_your_balance_is_zero(continuous_market, vega: VegaService, page: Page):
    page.goto(f"/#/markets/{continuous_market}")
    vega.create_key("key_empty")
    page.get_by_test_id("manage-vega-wallet").click()
    page.locator('[role="menuitemradio"]').nth(4).click()
    page.reload()
    page.get_by_test_id(order_size).fill("200")
    page.get_by_test_id(order_price).fill("20")
    # 7002-SORD-060
    expect(page.get_by_test_id(place_order)).to_be_enabled()
    # 7002-SORD-003
    expect(page.get_by_test_id("deal-ticket-error-message-zero-balance")).to_have_text("You need tDAI in your wallet to trade in this market. Make a deposit")
    expect(page.get_by_test_id(deal_ticket_deposit_dialog_button)).to_be_visible()    
