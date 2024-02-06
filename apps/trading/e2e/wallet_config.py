from collections import namedtuple

# Defined namedtuples
WalletConfig = namedtuple("WalletConfig", ["name", "passphrase"])

# Wallet Configurations
MM_WALLET = WalletConfig("market_maker", "pin")
MM_WALLET2 = WalletConfig("market_maker_2", "pin2")
GOVERNANCE_WALLET = WalletConfig(
    "FJMKnwfZdd48C8NqvYrG", "bY3DxwtsCstMIIZdNpKs")


wallets = [MM_WALLET, MM_WALLET2, GOVERNANCE_WALLET]
