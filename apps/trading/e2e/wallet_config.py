from collections import namedtuple

# Defined namedtuples
WalletConfig = namedtuple("WalletConfig", ["name", "passphrase"])

# Wallet Configurations
MM_WALLET = WalletConfig("market_maker", "pin")
MM_WALLET2 = WalletConfig("market_maker_2", "pin2")
TERMINATE_WALLET = WalletConfig("FJMKnwfZdd48C8NqvYrG", "bY3DxwtsCstMIIZdNpKs")
GOVERNANCE_WALLET = WalletConfig("FJMKnwfZdd48C8NqvYrG", "bY3DxwtsCstMIIZdNpKs")
PARTY_A = WalletConfig("party_a", "party_a")
PARTY_B = WalletConfig("party_b", "party_b")

wallets = [MM_WALLET, MM_WALLET2, TERMINATE_WALLET, GOVERNANCE_WALLET]
