import pytest 
import re
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from actions.utils import wait_for_toast_confirmation, create_and_faucet_wallet, WalletConfig, next_epoch, change_keys
import vega_sim.proto.vega as vega_protos

LIQ = WalletConfig("liq", "liq")
PARTY_A = WalletConfig("party_a", "party_a")
PARTY_B = WalletConfig("party_b", "party_b")
PARTY_C = WalletConfig("party_c", "party_c")

@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_transfer_submit(continuous_market, vega: VegaService, page: Page):
    # 1003-TRAN-001
    # 1003-TRAN-006
    # 1003-TRAN-007
    # 1003-TRAN-008
    # 1003-TRAN-009
    # 1003-TRAN-010
    # 1003-TRAN-023
    page.goto('/#/portfolio')
    
    expect(page.get_by_test_id('transfer-form')).to_be_visible
    page.get_by_test_id('select-asset').click()
    expect(page.get_by_test_id('rich-select-option')).to_have_count(1)
    
    page.get_by_test_id('rich-select-option').click()
    page.select_option('[data-testid=transfer-form] [name="toVegaKey"]', index=2)
    page.select_option('[data-testid=transfer-form] [name="fromAccount"]', index=1)
    
    expected_asset_text = re.compile(r"tDAI tDAI999,991.49731 tDAI.{6}….{4}")
    actual_asset_text = page.get_by_test_id('select-asset').text_content().strip()
   
    assert expected_asset_text.search(actual_asset_text), f"Expected pattern not found in {actual_asset_text}"
    
    page.locator('[data-testid=transfer-form] input[name="amount"]').fill('1')
    expect(page.locator('[data-testid=transfer-form] input[name="amount"]')).not_to_be_empty()
    
    page.locator('[data-testid=transfer-form] [type="submit"]').click()
    wait_for_toast_confirmation(page)
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expected_confirmation_text = re.compile(r"Transfer completeYour transaction has been confirmedView in block explorerTransferTo .{6}….{6}1\.00 tDAI")
    actual_confirmation_text = page.get_by_test_id('toast-content').text_content()
    assert expected_confirmation_text.search(actual_confirmation_text), f"Expected pattern not found in {actual_confirmation_text}"
    

@pytest.mark.usefixtures("page", "auth", "risk_accepted")
def test_transfer_vesting_below_minimum(continuous_market, vega: VegaService, page: Page):
    vega.update_network_parameter(
    "market_maker", parameter="transfer.minTransferQuantumMultiple", new_value="100000" 
    )
    vega.wait_for_total_catchup()
    
    create_and_faucet_wallet(vega=vega, wallet=PARTY_A, amount=1e3)
    create_and_faucet_wallet(vega=vega, wallet=PARTY_B, amount=1e5)
    create_and_faucet_wallet(vega=vega, wallet=PARTY_C, amount=1e5)
    vega.wait_for_total_catchup()

    asset_id = vega.find_asset_id(symbol="tDAI")
    next_epoch(vega=vega)

    vega.recurring_transfer(
        from_key_name=PARTY_A.name,
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=asset_id,
        asset_for_metric=asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        amount=100,
        factor=1.0,
    )
    # Generate trades for non-zero metrics
    vega.submit_order(
        trading_key=PARTY_B.name,
        market_id=continuous_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_SELL",
        price=0.30,
        volume=100,
    )
    vega.submit_order(
        trading_key=PARTY_C.name,
        market_id=continuous_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_BUY",
        price=0.30,
        volume=100,
    )
    vega.wait_for_total_catchup()
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    page.goto('/#/portfolio')
    expect(page.get_by_test_id('transfer-form')).to_be_visible
    
    change_keys(page, vega, "party_b")
    page.get_by_test_id('select-asset').click()
    page.get_by_test_id('rich-select-option').click()
    
    option_value = page.locator('[data-testid="transfer-form"] [name="fromAccount"] option[value^="ACCOUNT_TYPE_VESTED_REWARDS"]').first.get_attribute("value")

    page.select_option('[data-testid="transfer-form"] [name="fromAccount"]', option_value)

    page.locator('[data-testid=transfer-form] input[name="amount"]').fill('0.000001')
    page.locator('[data-testid=transfer-form] [type="submit"]').click()
    expect(page.get_by_test_id('input-error-text')).to_be_visible
    expect(page.get_by_test_id('input-error-text')).to_have_text("Amount below minimum requirements for partial transfer. Use max to bypass")
    vega.one_off_transfer(
        from_key_name=PARTY_B.name,
        to_key_name=PARTY_B.name,
        from_account_type= vega_protos.vega.AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        to_account_type= vega_protos.vega.AccountType.ACCOUNT_TYPE_GENERAL,
        asset= asset_id,
        amount= 24.999999,
    )
    vega.forward("10s")
    vega.wait_fn(10)
    vega.wait_for_total_catchup()
    
    page.get_by_text("Use max").first.click()
    page.locator('[data-testid=transfer-form] [type="submit"]').click()
    wait_for_toast_confirmation(page)
    vega.forward("10s")
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expected_confirmation_text = re.compile(r"Transfer completeYour transaction has been confirmedView in block explorerTransferTo .{6}….{6}0\.00001 tDAI")
    actual_confirmation_text = page.get_by_test_id('toast-content').text_content()
    assert expected_confirmation_text.search(actual_confirmation_text), f"Expected pattern not found in {actual_confirmation_text}"