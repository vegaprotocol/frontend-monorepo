import pytest 
import re
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from actions.utils import wait_for_toast_confirmation

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
    page.select_option('[data-testid=transfer-form] [name="toAddress"]', index=1)
    
    page.get_by_test_id('select-asset').click()
    expect(page.get_by_test_id('rich-select-option')).to_have_count(1)
    
    page.get_by_test_id('rich-select-option').click()
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
    expected_confirmation_text = re.compile(r"Transfer completeYour transaction has been confirmed View in block explorerTransferTo .{6}….{6}1\.00 tDAI")
    actual_confirmation_text = page.get_by_test_id('toast-content').text_content()
    print(f"Actual text is: {actual_confirmation_text}")
    assert expected_confirmation_text.search(actual_confirmation_text), f"Expected pattern not found in {actual_confirmation_text}"
    