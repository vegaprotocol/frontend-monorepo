import pytest
import re
from playwright.sync_api import Page, expect
from vega_sim.null_service import VegaServiceNull
from actions.utils import (
    wait_for_toast_confirmation,
    create_and_faucet_wallet,
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
@pytest.mark.parametrize("vega", ["shared"], indirect=True)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_transfer_submit(shared_continuous_market, vega: VegaServiceNull, page: Page):
    # 1003-TRAN-001
    # 1003-TRAN-006
    # 1003-TRAN-007
    # 1003-TRAN-008
    # 1003-TRAN-009
    # 1003-TRAN-010
    # 1003-TRAN-023
    page.goto("/#/portfolio")
    expect(page.get_by_test_id("transfer-form")).to_be_visible
    page.get_by_test_id("select-asset").click()

    page.get_by_test_id("rich-select-option").first.click()
    page.select_option('[data-testid=transfer-form] [name="toVegaKey"]', index=2)
    page.select_option('[data-testid=transfer-form] [name="fromAccount"]', index=1)
    expect(page.get_by_test_id("select-asset")).to_be_visible()

    page.locator('[data-testid=transfer-form] input[name="amount"]').fill("1")
    expect(
        page.locator('[data-testid=transfer-form] input[name="amount"]')
    ).not_to_be_empty()

    page.locator('[data-testid=transfer-form] [type="submit"]').click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expected_confirmation_text = re.compile(
        r"Transfer completeYour transaction has been confirmedView in block explorerTransferTo .{6}….{6}1\.00 tDAI"
    )
    actual_confirmation_text = page.get_by_test_id("toast-content").text_content()
    assert expected_confirmation_text.search(
        actual_confirmation_text
    ), f"Expected pattern not found in {actual_confirmation_text}"


@pytest.mark.shared_vega
@pytest.mark.xdist_group(name="shared_vega")
@pytest.mark.parametrize("vega", ["shared"], indirect=True)
@pytest.mark.usefixtures("auth", "risk_accepted")
def test_transfer_vesting_below_minimum(
    shared_continuous_market, vega: VegaServiceNull, page: Page
):
    vega.update_network_parameter(
        "market_maker",
        parameter="transfer.minTransferQuantumMultiple",
        new_value="100000",
    )
    tDAI_asset_id = vega.find_asset_id(symbol="tDAI")
    vega.mint(key_name="market_maker", asset=tDAI_asset_id, amount=100000)
    next_epoch(vega=vega)
    

    asset_id = vega.find_asset_id(symbol="tDAI")
    vega.recurring_transfer(
        from_key_name="market_maker",
        from_account_type=vega_protos.vega.ACCOUNT_TYPE_GENERAL,
        to_account_type=vega_protos.vega.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
        asset=asset_id,
        asset_for_metric=asset_id,
        metric=vega_protos.vega.DISPATCH_METRIC_MAKER_FEES_PAID,
        amount=100,
        factor=1.0,
    )
    next_epoch(vega=vega)
    # Generate trades for non-zero metrics
    vega.submit_order(
        trading_key="Key 1",
        market_id=shared_continuous_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_SELL",
        price=0.30,
        volume=1,
    )
    vega.submit_order(
        trading_key="market_maker_2",
        market_id=shared_continuous_market,
        order_type="TYPE_LIMIT",
        time_in_force="TIME_IN_FORCE_GTC",
        side="SIDE_BUY",
        price=0.30,
        volume=1,
    )
    vega.wait_for_total_catchup()
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    next_epoch(vega=vega)
    page.goto("/#/portfolio")
    expect(page.get_by_test_id("transfer-form")).to_be_visible

    change_keys(page, vega, "Key 1")
    page.get_by_test_id("select-asset").click()
    page.get_by_test_id("rich-select-option").first.click()
    page.pause()
    option_value = page.locator(
        '[data-testid="transfer-form"] [name="fromAccount"] option[value^="ACCOUNT_TYPE_VESTED_REWARDS"]'
    ).first.get_attribute("value")

    page.select_option(
        '[data-testid="transfer-form"] [name="fromAccount"]', option_value
    )

    page.locator('[data-testid=transfer-form] input[name="amount"]').fill("0.000001")
    page.locator('[data-testid=transfer-form] [type="submit"]').click()
    expect(page.get_by_test_id("input-error-text")).to_be_visible
    expect(page.get_by_test_id("input-error-text")).to_have_text(
        "Amount below minimum requirements for partial transfer. Use max to bypass"
    )
    vega.one_off_transfer(
        from_key_name="Key 1",
        to_key_name="Key 1",
        from_account_type=vega_protos.vega.AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
        to_account_type=vega_protos.vega.AccountType.ACCOUNT_TYPE_GENERAL,
        asset=asset_id,
        amount=24.999999,
    )
    vega.wait_fn(10)
    vega.wait_for_total_catchup()

    page.get_by_test_id("use-max-button").first.click()
    page.locator('[data-testid=transfer-form] [type="submit"]').click()
    wait_for_toast_confirmation(page)
    vega.wait_fn(1)
    vega.wait_for_total_catchup()
    expect(page.get_by_test_id("toast-content")).to_contain_text("Transfer complete")
