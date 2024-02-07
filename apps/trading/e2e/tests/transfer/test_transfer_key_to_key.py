import pytest
import re
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.utils import (
    wait_for_toast_confirmation,
    WalletConfig,
    next_epoch,
    change_keys,
)
import vega_sim.proto.vega as vega_protos

PARTY_A = WalletConfig("party_a", "party_a")
PARTY_B = WalletConfig("party_b", "party_b")
PARTY_C = WalletConfig("party_c", "party_c")


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_transfer_submit(shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_auth, shared_risk_accepted):
    # 1003-TRAN-001
    # 1003-TRAN-006
    # 1003-TRAN-007
    # 1003-TRAN-008
    # 1003-TRAN-009
    # 1003-TRAN-010
    # 1003-TRAN-023
    shared_page.goto("/#/portfolio")
    expect(shared_page.get_by_test_id("transfer-form")).to_be_visible
    shared_page.get_by_test_id("select-asset").click()

    shared_page.get_by_test_id("rich-select-option").first.click()
    shared_page.select_option('[data-testid=transfer-form] [name="toVegaKey"]', index=2)
    shared_page.select_option('[data-testid=transfer-form] [name="fromAccount"]', index=1)
    expect(shared_page.get_by_test_id("select-asset")).to_be_visible()

    shared_page.locator('[data-testid=transfer-form] input[name="amount"]').fill("1")
    expect(
        shared_page.locator('[data-testid=transfer-form] input[name="amount"]')
    ).not_to_be_empty()

    shared_page.locator('[data-testid=transfer-form] [type="submit"]').click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    expected_confirmation_text = re.compile(
        r"Transfer completeYour transaction has been confirmedView in block explorerTransferTo .{6}….{6}1\.00 tDAI"
    )
    actual_confirmation_text = shared_page.get_by_test_id("toast-content").text_content()
    assert expected_confirmation_text.search(
        actual_confirmation_text
    ), f"Expected pattern not found in {actual_confirmation_text}"


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
def test_transfer_vesting_below_minimum(
    shared_continuous_market, shared_vega: VegaServiceNull, shared_page: Page, shared_auth, shared_risk_accepted
):
    shared_vega.update_network_parameter(
        "market_maker",
        parameter="transfer.minTransferQuantumMultiple",
        new_value="100000",
    )
    tDAI_asset_id = shared_vega.find_asset_id(symbol="tDAI")
    shared_vega.mint(key_name="market_maker", asset=tDAI_asset_id, amount=100000)
    shared_vega.mint(key_name="market_maker_2", asset=tDAI_asset_id, amount=10000)
    next_epoch(vega=shared_vega)
    

    asset_id = shared_vega.find_asset_id(symbol="tDAI")
    shared_vega.recurring_transfer(
        from_key_name="market_maker",
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=asset_id,
        asset_for_metric=asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        amount=100,
        factor=1.0,
    )
    next_epoch(vega=shared_vega)
    # Generate trades for non-zero metrics
    shared_vega.submit_order(
        trading_key="Key 1",
        market_id=shared_continuous_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_SELL",
        price=0.10,
        volume=1,
    )
    shared_vega.submit_order(
        trading_key="market_maker_2",
        market_id=shared_continuous_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_BUY",
        price=0.10,
        volume=1,
    )
    shared_vega.wait_fn(10)
    shared_vega.wait_for_total_catchup()
    next_epoch(vega=shared_vega)
    next_epoch(vega=shared_vega)
    next_epoch(vega=shared_vega)
    next_epoch(vega=shared_vega)
    next_epoch(vega=shared_vega)
    next_epoch(vega=shared_vega)
    shared_vega.wait_for_total_catchup()
    shared_page.goto("/#/portfolio")
    expect(shared_page.get_by_test_id("transfer-form")).to_be_visible

    change_keys(shared_page, shared_vega, "Key 1")
    shared_page.get_by_test_id("select-asset").click()
    shared_page.get_by_test_id("rich-select-option").first.click()
    option_value = shared_page.locator(
        '[data-testid="transfer-form"] [name="fromAccount"] option[value^="ACCOUNT_TYPE_VESTED_REWARDS"]'
    ).first.get_attribute("value")

    shared_page.select_option(
        '[data-testid="transfer-form"] [name="fromAccount"]', option_value
    )

    shared_page.locator('[data-testid=transfer-form] input[name="amount"]').fill("0.000001")
    shared_page.locator('[data-testid=transfer-form] [type="submit"]').click()
    expect(shared_page.get_by_test_id("input-error-text")).to_be_visible
    expect(shared_page.get_by_test_id("input-error-text")).to_have_text(
        "Amount below minimum requirements for partial transfer. Use max to bypass"
    )
    shared_vega.one_off_transfer(
        from_key_name="Key 1",
        to_key_name="Key 1",
        from_account_type=vega_protos.vega.AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        to_account_type=vega_protos.vega.AccountType.ACCOUNT_TYPE_GENERAL,
        asset=asset_id,
        amount=24.999999,
    )
    shared_vega.wait_fn(10)
    shared_vega.wait_for_total_catchup()

    shared_page.get_by_test_id("use-max-button").first.click()
    shared_page.locator('[data-testid=transfer-form] [type="submit"]').click()
    wait_for_toast_confirmation(shared_page)
    shared_vega.wait_fn(1)
    shared_vega.wait_for_total_catchup()
    expect(shared_page.get_by_test_id("toast-content")).to_contain_text("Transfer complete")
