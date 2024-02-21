from actions.utils import create_and_faucet_wallet
from wallet_config import WalletConfig
# region Constants
ACTIVITY = "activity"
HOARDER = "hoarder"
COMBO = "combo"

REWARDS_URL = "/#/rewards"

# test IDs
COMBINED_MULTIPLIERS = "combined-multipliers"
TOTAL_REWARDS = "total-rewards"
PRICE_TAKING_COL_ID = '[col-id="priceTaking"]'
TOTAL_COL_ID = '[col-id="total"]'
ROW = "row"
STREAK_REWARD_MULTIPLIER_VALUE = "streak-reward-multiplier-value"
HOARDER_REWARD_MULTIPLIER_VALUE = "hoarder-reward-multiplier-value"
HOARDER_BONUS_TOTAL_HOARDED = "hoarder-bonus-total-hoarded"
EARNED_BY_ME_BUTTON = "earned-by-me-button"
TRANSFER_AMOUNT = "transfer-amount"
EPOCH_STREAK = "epoch-streak"

# endregion

# Keys
PARTY_A = "PARTY_A"
PARTY_B = "PARTY_B"
PARTY_C = "PARTY_C"
PARTY_D = "PARTY_D"

ACTIVITY_STREAKS = """
{
    "tiers": [
        {
            "minimum_activity_streak": 2, 
            "reward_multiplier": "2.0", 
            "vesting_multiplier": "1.1"
        }
    ]
}
"""
VESTING = """
{
    "tiers": [
        {
            "minimum_quantum_balance": "10000000",
            "reward_multiplier": "2"
        }
    ]
}
"""

def keys(vega):
    PARTY_A = WalletConfig("PARTY_A", "PARTY_A")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_A)
    PARTY_B = WalletConfig("PARTY_B", "PARTY_B")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_B)
    PARTY_C = WalletConfig("PARTY_C", "PARTY_C")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_C)
    PARTY_D = WalletConfig("PARTY_D", "PARTY_D")
    create_and_faucet_wallet(vega=vega, wallet=PARTY_D)
    return PARTY_A, PARTY_B, PARTY_C, PARTY_D
