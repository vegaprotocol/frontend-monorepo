from collections import namedtuple

# Defined namedtuples
WalletConfig = namedtuple("WalletConfig", ["name", "passphrase"])

# Wallet Configurations
MM_WALLET = WalletConfig("market_maker", "pin")
MM_WALLET2 = WalletConfig("market_maker_2", "pin2")
TERMINATE_WALLET = WalletConfig("FJMKnwfZdd48C8NqvYrG", "bY3DxwtsCstMIIZdNpKs")
GOVERNANCE_WALLET = WalletConfig(
    "FJMKnwfZdd48C8NqvYrG", "bY3DxwtsCstMIIZdNpKs")
PARTY_A = WalletConfig("party_a", "party_a")
PARTY_B = WalletConfig("party_b", "party_b")
PARTY_C = WalletConfig("party_c", "party_c")
PARTY_D = WalletConfig("party_d", "party_d")

wallets = [MM_WALLET, MM_WALLET2, TERMINATE_WALLET, GOVERNANCE_WALLET, PARTY_A, PARTY_B, PARTY_C, PARTY_D]
