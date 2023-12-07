import pytest
import re
import json
from playwright.sync_api import Page, expect
from vega_sim.service import VegaService
from actions.vega import submit_order
from wallet_config import MM_WALLET
from conftest import init_vega
from actions.utils import next_epoch
from fixtures.market import setup_continuous_market

class TestVolumeDiscountProgramTier1:

    @pytest.fixture(scope="class")
    def vega(self, request):
        with init_vega(request) as vega:
            yield vega

    @pytest.fixture(scope="class")
    def market_tier_1_volume_discount(self, vega:VegaService):
        market_tier_1_volume_discount = setup_continuous_market(vega, custom_quantum=100000)
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
            }
        ],
        window_length=7,
        )
        next_epoch(vega=vega)
        submit_order(vega, "Key 1", market_tier_1_volume_discount, "SIDE_BUY", 1, 110)
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        next_epoch(vega=vega)
        return market_tier_1_volume_discount

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_volume_discount_program_tier_1_my_trading_fees(self, market_tier_1_volume_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("adjusted-fees")).to_have_text("9.045%-9.045%")
        expect(page.get_by_test_id("total-fee-before-discount")).to_have_text("Total fee before discount10.05%-10.05%")
        expect(page.get_by_test_id("infrastructure-fees")).to_have_text("Infrastructure0.05%")
        expect(page.get_by_test_id("maker-fees")).to_have_text("Maker10%")
        expect(page.get_by_test_id("liquidity-fees")).to_have_text("Liquidity0%-0%")

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_volume_discount_program_tier_1_total_discount(self, market_tier_1_volume_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("total-discount")).to_have_text("10%")
        expect(page.get_by_test_id("volume-discount-row")).to_have_text("Volume discount10%")
        expect(page.get_by_test_id("referral-discount-row")).to_have_text("Referral discount0%")
        #page.get_by_test_id("icon-info").hover()
        #expect(page.get_by_test_id("tooltip-content").nth(0)).to_have_text("No active referral programme")
        page.get_by_test_id("total-discount").hover()
        expect(page.get_by_test_id("tooltip-content").nth(0)).to_have_text("The total discount is calculated according to the following formula: 1 - (1 - dvolume) ⋇ (1 - dreferral)")

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_volume_discount_program_tier_1_my_current_volume(self, market_tier_1_volume_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("past-epochs-volume")).to_have_text("103")
        expect(page.get_by_test_id("required-for-next-tier")).to_have_text("97")
    
    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_volume_discount_program_tier_1_volume_discount(self, market_tier_1_volume_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("tier-value-0")).to_have_text("1")
        expect(page.get_by_test_id("tier-value-1")).to_have_text("2")
        expect(page.get_by_test_id("discount-value-0")).to_have_text("10%")
        expect(page.get_by_test_id("discount-value-1")).to_have_text("20%")
        expect(page.get_by_test_id("min-volume-value-0")).to_have_text("100")
        expect(page.get_by_test_id("min-volume-value-1")).to_have_text("200")
        expect(page.get_by_test_id("my-volume-value-0")).to_have_text("103")
        expect(page.get_by_test_id("your-tier-0")).to_be_visible()
        expect(page.get_by_test_id("your-tier-0")).to_have_text("Your tier")
    
    
    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_volume_discount_program_tier_1_fees_by_market(self, market_tier_1_volume_discount, page: Page):
        page.goto("/#/fees")
        row = page.locator(".ag-center-cols-container .ag-row")
        expect(row.locator('[col-id="code"]')).to_have_text("BTC:DAI_2023Futr")
        expect(row.locator('[col-id="feeAfterDiscount"]')).to_have_text("9.045%")
        expect(row.locator('[col-id="infraFee"]')).to_have_text("0.05%")
        expect(row.locator('[col-id="makerFee"]')).to_have_text("10%")
        expect(row.locator('[col-id="liquidityFee"]')).to_have_text("0%")
        expect(row.locator('[col-id="totalFee"]')).to_have_text("10.05%")

class TestVolumeDiscountProgramTier2:

    @pytest.fixture(scope="class")
    def vega(self, request):
        with init_vega(request) as vega:
            yield vega

    @pytest.fixture(scope="class")
    def market_tier_2_volume_discount(self, vega:VegaService):
        market_tier_2_volume_discount = setup_continuous_market(vega, custom_quantum=100000)
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
            }
        ],
        window_length=7,
        )
        next_epoch(vega=vega)
        submit_order(vega, "Key 1", market_tier_2_volume_discount, "SIDE_BUY", 1, 110)
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        next_epoch(vega=vega)
        submit_order(vega, "Key 1", market_tier_2_volume_discount, "SIDE_BUY", 1, 110)
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        next_epoch(vega=vega)
        return market_tier_2_volume_discount

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_volume_discount_program_tier_2_my_trading_fees(self, market_tier_2_volume_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("adjusted-fees")).to_have_text("8.04%-8.04%")
        expect(page.get_by_test_id("total-fee-before-discount")).to_have_text("Total fee before discount10.05%-10.05%")
        expect(page.get_by_test_id("infrastructure-fees")).to_have_text("Infrastructure0.05%")
        expect(page.get_by_test_id("maker-fees")).to_have_text("Maker10%")
        expect(page.get_by_test_id("liquidity-fees")).to_have_text("Liquidity0%-0%")

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_volume_discount_program_tier_2_total_discount(self, market_tier_2_volume_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("total-discount")).to_have_text("20%")
        expect(page.get_by_test_id("volume-discount-row")).to_have_text("Volume discount20%")
        expect(page.get_by_test_id("referral-discount-row")).to_have_text("Referral discount0%")
        #page.get_by_test_id("icon-info").hover()
        #expect(page.get_by_test_id("tooltip-content").nth(0)).to_have_text("No active referral programme")

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_volume_discount_program_tier_2_my_current_volume(self, market_tier_2_volume_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("past-epochs-volume")).to_have_text("206")
        expect(page.get_by_test_id("required-for-next-tier")).not_to_be_visible()
    
    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_volume_discount_program_tier_2_volume_discount(self, market_tier_2_volume_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("tier-value-0")).to_have_text("1")
        expect(page.get_by_test_id("tier-value-1")).to_have_text("2")
        expect(page.get_by_test_id("discount-value-0")).to_have_text("10%")
        expect(page.get_by_test_id("discount-value-1")).to_have_text("20%")
        expect(page.get_by_test_id("min-volume-value-0")).to_have_text("100")
        expect(page.get_by_test_id("min-volume-value-1")).to_have_text("200")
        expect(page.get_by_test_id("my-volume-value-1")).to_have_text("206")  
        expect(page.get_by_test_id("your-tier-1")).to_be_visible()
        expect(page.get_by_test_id("your-tier-1")).to_have_text("Your tier")
    
    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_volume_discount_program_tier_2_fees_by_market(self, market_tier_2_volume_discount, page: Page):
        page.goto("/#/fees")
        row = page.locator(".ag-center-cols-container .ag-row")
        expect(row.locator('[col-id="code"]')).to_have_text("BTC:DAI_2023Futr")
        expect(row.locator('[col-id="feeAfterDiscount"]')).to_have_text("8.04%")
        expect(row.locator('[col-id="infraFee"]')).to_have_text("0.05%")
        expect(row.locator('[col-id="makerFee"]')).to_have_text("10%")
        expect(row.locator('[col-id="liquidityFee"]')).to_have_text("0%")
        expect(row.locator('[col-id="totalFee"]')).to_have_text("10.05%")

class TestReferralDiscountProgramTier1:

    @pytest.fixture(scope="class")
    def vega(self, request):
        with init_vega(request) as vega:
            yield vega

    @pytest.fixture(scope="class")
    def market_tier_1_referral_discount(self, vega:VegaService):
        market_tier_1_referral_discount = setup_continuous_market(vega, custom_quantum=100000)
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
        submit_order(vega, "Key 1", market_tier_1_referral_discount, "SIDE_BUY", 1, 110)
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        next_epoch(vega=vega)
        return market_tier_1_referral_discount

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_referral_discount_program_tier_1_my_trading_fees(self, market_tier_1_referral_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("adjusted-fees")).to_have_text("9.045%-9.045%")
        expect(page.get_by_test_id("total-fee-before-discount")).to_have_text("Total fee before discount10.05%-10.05%")
        expect(page.get_by_test_id("infrastructure-fees")).to_have_text("Infrastructure0.05%")
        expect(page.get_by_test_id("maker-fees")).to_have_text("Maker10%")
        expect(page.get_by_test_id("liquidity-fees")).to_have_text("Liquidity0%-0%")

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_referral_discount_program_tier_1_total_discount(self, market_tier_1_referral_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("total-discount")).to_have_text("10%")
        expect(page.get_by_test_id("volume-discount-row")).to_have_text("Volume discount0%")
        expect(page.get_by_test_id("referral-discount-row")).to_have_text("Referral discount10%")
        #page.get_by_test_id("icon-info").hover()
        #expect(page.get_by_test_id("tooltip-content").nth(0)).to_have_text("No active referral programme")

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_referral_discount_program_tier_1_referral_benefits(self, market_tier_1_referral_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("running-notional-taker-volume")).to_have_text("103")
        expect(page.get_by_test_id("epochs-in-referral-set")).to_have_text("1")
    
    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_referral_discount_program_tier_1_referral_discount(self, market_tier_1_referral_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("tier-value-0")).to_have_text("1")
        expect(page.get_by_test_id("tier-value-1")).to_have_text("2")
        expect(page.get_by_test_id("discount-value-0")).to_have_text("10%")
        expect(page.get_by_test_id("discount-value-1")).to_have_text("20%")
        expect(page.get_by_test_id("min-volume-value-0")).to_have_text("100")
        expect(page.get_by_test_id("min-volume-value-1")).to_have_text("200")
        expect(page.get_by_test_id("required-epochs-value-0")).to_have_text("1")
        expect(page.get_by_test_id("required-epochs-value-1")).to_have_text("2")
        expect(page.get_by_test_id("your-tier-0")).to_be_visible()
        expect(page.get_by_test_id("your-tier-0")).to_have_text("Your tier")
    
    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_referral_discount_program_tier_1_fees_by_market(self, market_tier_1_referral_discount, page: Page):
        page.goto("/#/fees")
        row = page.locator(".ag-center-cols-container .ag-row")
        expect(row.locator('[col-id="code"]')).to_have_text("BTC:DAI_2023Futr")
        expect(row.locator('[col-id="feeAfterDiscount"]')).to_have_text("9.045%")
        expect(row.locator('[col-id="infraFee"]')).to_have_text("0.05%")
        expect(row.locator('[col-id="makerFee"]')).to_have_text("10%")
        expect(row.locator('[col-id="liquidityFee"]')).to_have_text("0%")
        expect(row.locator('[col-id="totalFee"]')).to_have_text("10.05%")

class TestReferralDiscountProgramTier2:

    @pytest.fixture(scope="class")
    def vega(self, request):
        with init_vega(request) as vega:
            yield vega

    @pytest.fixture(scope="class")
    def market_tier_2_referral_discount(self, vega:VegaService):
        market_tier_2_referral_discount = setup_continuous_market(vega, custom_quantum=100000)
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
        submit_order(vega, "Key 1", market_tier_2_referral_discount, "SIDE_BUY", 2, 110)
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        next_epoch(vega=vega)
        submit_order(vega, "Key 1", market_tier_2_referral_discount, "SIDE_BUY", 1, 110)
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        return market_tier_2_referral_discount

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_referral_discount_program_tier_2_my_trading_fees(self, vega:VegaService, market_tier_2_referral_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("adjusted-fees")).to_have_text("8.04%-8.04%")
        expect(page.get_by_test_id("total-fee-before-discount")).to_have_text("Total fee before discount10.05%-10.05%")
        expect(page.get_by_test_id("infrastructure-fees")).to_have_text("Infrastructure0.05%")
        expect(page.get_by_test_id("maker-fees")).to_have_text("Maker10%")
        expect(page.get_by_test_id("liquidity-fees")).to_have_text("Liquidity0%-0%")

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_referral_discount_program_tier_1_total_discount(self, market_tier_2_referral_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("total-discount")).to_have_text("20%")
        expect(page.get_by_test_id("volume-discount-row")).to_have_text("Volume discount0%")
        expect(page.get_by_test_id("referral-discount-row")).to_have_text("Referral discount20%")

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_referral_discount_program_tier_1_referral_benefits(self, market_tier_2_referral_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("running-notional-taker-volume")).to_have_text("207")
        expect(page.get_by_test_id("epochs-in-referral-set")).to_have_text("1")
    
    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_referral_discount_program_tier_1_referral_discount(self, market_tier_2_referral_discount, page: Page):
        page.goto("/#/fees")
        expect(page.get_by_test_id("tier-value-0")).to_have_text("1")
        expect(page.get_by_test_id("tier-value-1")).to_have_text("2")
        expect(page.get_by_test_id("discount-value-0")).to_have_text("10%")
        expect(page.get_by_test_id("discount-value-1")).to_have_text("20%")
        expect(page.get_by_test_id("min-volume-value-0")).to_have_text("100")
        expect(page.get_by_test_id("min-volume-value-1")).to_have_text("200")
        expect(page.get_by_test_id("required-epochs-value-0")).to_have_text("1")
        expect(page.get_by_test_id("required-epochs-value-1")).to_have_text("2")
        expect(page.get_by_test_id("your-tier-1")).to_be_visible()
        expect(page.get_by_test_id("your-tier-1")).to_have_text("Your tier")
    
    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fees_page_referral_discount_program_tier_1_fees_by_market(self, market_tier_2_referral_discount, page: Page):
        page.goto("/#/fees")
        row = page.locator(".ag-center-cols-container .ag-row")
        expect(row.locator('[col-id="code"]')).to_have_text("BTC:DAI_2023Futr")
        expect(row.locator('[col-id="feeAfterDiscount"]')).to_have_text("8.04%")
        expect(row.locator('[col-id="infraFee"]')).to_have_text("0.05%")
        expect(row.locator('[col-id="makerFee"]')).to_have_text("10%")
        expect(row.locator('[col-id="liquidityFee"]')).to_have_text("0%")
        expect(row.locator('[col-id="totalFee"]')).to_have_text("10.05%")

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_fills_referral_discount_program_tier_2(self, vega:VegaService, market_tier_2_referral_discount, page: Page):
        page.goto("/#/fees")
        page.pause()
        submit_order(vega, "Key 1", market_tier_2_referral_discount, "SIDE_BUY", 1, 110)
        vega.wait_fn(1)
        vega.wait_for_total_catchup()
        page.pause()
        expect(page.get_by_test_id("adjusted-fees")).to_have_text("8.04%-8.04%")
        expect(page.get_by_test_id("total-fee-before-discount")).to_have_text("Total fee before discount10.05%-10.05%")
        expect(page.get_by_test_id("infrastructure-fees")).to_have_text("Infrastructure0.05%")
        expect(page.get_by_test_id("maker-fees")).to_have_text("Maker10%")
        expect(page.get_by_test_id("liquidity-fees")).to_have_text("Liquidity0%-0%")

    @pytest.mark.usefixtures("vega", "page", "risk_accepted", "auth")
    def test_deal_ticket_referral_discount_program_tier_2(self, vega:VegaService, market_tier_2_referral_discount, page: Page):
        page.goto(f"/#/markets/{market_tier_2_referral_discount}")
        page.get_by_test_id("order-size").fill("1")
        page.get_by_test_id("order-price").fill("1")
        expect(page.get_by_test_id("discount-pill")).to_have_text("-20%")
        page.get_by_test_id("fees-text").hover()
        tooltip = page.get_by_test_id("tooltip-content").first
        expect(tooltip.get_by_test_id("infrastructure-fee-factor")).to_have_text("0.05%")
        expect(tooltip.get_by_test_id("infrastructure-fee-value")).to_have_text("0.0005 tDAI")
        expect(tooltip.get_by_test_id("liquidity-fee-factor")).to_have_text("0%")
        expect(tooltip.get_by_test_id("liquidity-fee-value")).to_have_text("0.00 tDAI")
        expect(tooltip.get_by_test_id("maker-fee-factor")).to_have_text("10%")
        expect(tooltip.get_by_test_id("maker-fee-value")).to_have_text("0.10 tDAI")
        expect(tooltip.get_by_test_id("subtotal-fee-factor")).to_have_text("10.05%")
        expect(tooltip.get_by_test_id("subtotal-fee-value")).to_have_text("0.1005 tDAI")
        expect(tooltip.get_by_test_id("discount-fee-factor")).to_have_text("-20%")
        expect(tooltip.get_by_test_id("discount-fee-value")).to_have_text("-0.0201 tDAI")
        expect(tooltip.get_by_test_id("total-fee-value")).to_have_text("0.0804 tDAI")
       