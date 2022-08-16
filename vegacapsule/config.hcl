vega_binary_path         = "vega"

network "testnet" {
	ethereum {
    chain_id   = "1440"
    network_id = "1441"
    endpoint   = "http://127.0.0.1:8545/"
  }

  faucet "faucet-1" {
      wallet_pass = "f4uc3tw4ll3t-v3g4-p4ssphr4e3"

      template = <<-EOT
[Node]
  Port = 3002
  IP = "127.0.0.1"
EOT
  }

  wallet "wallet-1" {
    binary = "vegawallet"

    template = <<-EOT
Name = "DV"
Level = "info"
TokenExpiry = "168h0m0s"
Port = 1789
Host = "0.0.0.0"

[API]
  [API.GRPC]
    Hosts = [{{range $i, $v := .Validators}}{{if ne $i 0}},{{end}}"127.0.0.1:30{{$i}}2"{{end}}]
    Retries = 5
EOT
  }

  pre_start {
    docker_service "ganache-1" {
      image = "vegaprotocol/ganache:v1.2.4"
      cmd = "ganache-cli"
      args = [
        "--blockTime", "1",
        "--chainId", "1440",
        "--networkId", "1441",
        "-h", "0.0.0.0",
        "-p", "8545",
        "-m", "ozone access unlock valid olympic save include omit supply green clown session",
        "--db", "/app/ganache-db",
        "--account_keys_path", "keys.json"
      ]
      static_port {
        value  =  8545
      }
      auth_soft_fail = true
    }
  }

  genesis_template = <<EOH
{
	"app_state": {
	  "assets": {
		"fBTC": {
		  "min_lp_stake": "1",
		  "decimals": 5,
		  "name": "BTC (fake)",
		  "symbol": "fBTC",
		  "total_supply": "21000000",
		  "source": {
			"builtin_asset": {
			  "max_faucet_amount_mint": "1000000"
			}
		  }
		},
		"fDAI": {
		  "min_lp_stake": "1",
		  "decimals": 5,
		  "name": "DAI (fake)",
		  "symbol": "fDAI",
		  "total_supply": "1000000000",
		  "source": {
			"builtin_asset": {
			  "max_faucet_amount_mint": "10000000000"
			}
		  }
		},
		"fEURO": {
		  "min_lp_stake": "1",
		  "decimals": 5,
		  "name": "EURO (fake)",
		  "symbol": "fEURO",
		  "total_supply": "1000000000",
		  "source": {
			"builtin_asset": {
			  "max_faucet_amount_mint": "10000000000"
			}
		  }
		},
		"fUSDC": {
		  "min_lp_stake": "1",
		  "decimals": 5,
		  "name": "USDC (fake)",
		  "symbol": "fUSDC",
		  "total_supply": "1000000000",
		  "source": {
			"builtin_asset": {
			  "max_faucet_amount_mint": "1000000000000"
			}
		  }
		},
		"XYZalpha": {
		  "min_lp_stake": "1",
		  "decimals": 5,
		  "name": "XYZ (α alpha)",
		  "symbol": "XYZalpha",
		  "total_supply": "1000000000",
		  "source": {
			"builtin_asset": {
			  "max_faucet_amount_mint": "100000000000"
			}
		  }
		},
		"XYZbeta": {
		  "min_lp_stake": "1",
		  "decimals": 5,
		  "name": "XYZ (β beta)",
		  "symbol": "XYZbeta",
		  "total_supply": "1000000000",
		  "source": {
			"builtin_asset": {
			  "max_faucet_amount_mint": "100000000000"
			}
		  }
		},
		"XYZgamma": {
		  "min_lp_stake": "1",
		  "decimals": 5,
		  "name": "XYZ (γ gamma)",
		  "symbol": "XYZgamma",
		  "total_supply": "1000000000",
		  "source": {
			"builtin_asset": {
			  "max_faucet_amount_mint": "100000000000"
			}
		  }
		},
		"XYZdelta": {
		  "min_lp_stake": "1",
		  "decimals": 5,
		  "name": "XYZ (δ delta)",
		  "symbol": "XYZdelta",
		  "total_supply": "1000000000",
		  "source": {
			"builtin_asset": {
			  "max_faucet_amount_mint": "100000000000"
			}
		  }
		},
		"XYZepsilon": {
		  "min_lp_stake": "1",
		  "decimals": 5,
		  "name": "XYZ (ε epsilon)",
		  "symbol": "XYZepsilon",
		  "total_supply": "1000000000",
		  "source": {
			"builtin_asset": {
			  "max_faucet_amount_mint": "100000000000"
			}
		  }
		},
		"{{.GetVegaContractID "tBTC"}}": {
			"min_lp_stake": "1",
			"decimals": 5,
			"name": "BTC (local)",
			"symbol": "tBTC",
			"total_supply": "0",
			"source": {
				"erc20": {
					"contract_address": "{{.GetEthContractAddr "tBTC"}}"
				}
			}
		},
		"{{.GetVegaContractID "tDAI"}}": {
			"min_lp_stake": "1",
			"decimals": 5,
			"name": "DAI (local)",
			"symbol": "tDAI",
			"total_supply": "0",
			"source": {
				"erc20": {
					"contract_address": "{{.GetEthContractAddr "tDAI"}}"
				}
			}
		},
		"{{.GetVegaContractID "tEURO"}}": {
			"min_lp_stake": "1",
			"decimals": 5,
			"name": "EURO (local)",
			"symbol": "tEURO",
			"total_supply": "0",
			"source": {
				"erc20": {
					"contract_address": "{{.GetEthContractAddr "tEURO"}}"
				}
			}
		},
		"{{.GetVegaContractID "tUSDC"}}": {
			"min_lp_stake": "1",
			"decimals": 5,
			"name": "USDC (local)",
			"symbol": "tUSDC",
			"total_supply": "0",
			"source": {
				"erc20": {
				"contract_address": "{{.GetEthContractAddr "tUSDC"}}"
				}
			}
		},
		"{{.GetVegaContractID "VEGA"}}": {
			"min_lp_stake": "1",
			"decimals": 18,
			"name": "Vega",
			"symbol": "VEGA",
			"total_supply": "64999723000000000000000000",
			"source": {
				"erc20": {
				"contract_address": "{{.GetEthContractAddr "VEGA"}}"
				}
			}
		}
	  },
	  "network": {
		"ReplayAttackThreshold": 30
	  },
	  "network_parameters": {
      "blockchains.ethereumConfig": "{\"network_id\": \"{{ .NetworkID }}\", \"chain_id\": \"{{ .ChainID }}\", \"collateral_bridge_contract\": { \"address\": \"{{.GetEthContractAddr "erc20_bridge_1"}}\" }, \"confirmations\": 3, \"staking_bridge_contract\": { \"address\": \"{{.GetEthContractAddr "staking_bridge"}}\", \"deployment_block_height\": 0}, \"token_vesting_contract\": { \"address\": \"{{.GetEthContractAddr "erc20_vesting"}}\", \"deployment_block_height\": 0 }, \"multisig_control_contract\": { \"address\": \"{{.GetEthContractAddr "MultisigControl"}}\", \"deployment_block_height\": 0 }}",
		"governance.proposal.asset.minClose": "2s",
		"governance.proposal.asset.minEnact": "2s",
		"governance.proposal.asset.requiredParticipation": "0.00000000000000000000000015",
		"governance.proposal.market.minClose": "2s",
		"governance.proposal.market.minEnact": "2s",
		"governance.proposal.market.requiredParticipation": "0.00000000000000000000000015",
		"governance.proposal.updateMarket.minClose": "2s",
		"governance.proposal.updateMarket.minEnact": "2s",
		"governance.proposal.updateMarket.requiredParticipation": "0.00000000000000000000000015",
		"governance.proposal.updateNetParam.minClose": "2s",
		"governance.proposal.updateNetParam.minEnact": "2s",
		"governance.proposal.updateNetParam.requiredParticipation": "0.00000000000000000000000015",
		"market.auction.minimumDuration": "3s",
		"market.fee.factors.infrastructureFee": "0.001",
		"market.fee.factors.makerFee": "0.004",
		"market.monitor.price.updateFrequency": "1s",
		"market.liquidity.stakeToCcySiskas": "0.3",
		"market.liquidity.targetstake.triggering.ratio": "0.7",
		"network.checkpoint.timeElapsedBetweenCheckpoints": "10s",
		"reward.asset": "{{.GetVegaContractID "VEGA"}}",
		"reward.staking.delegation.competitionLevel": "3.1",
		"reward.staking.delegation.delegatorShare": "0.883",
		"reward.staking.delegation.maxPayoutPerParticipant": "700000000000000000000",
		"reward.staking.delegation.minimumValidatorStake": "3000000000000000000000",
		"reward.staking.delegation.payoutDelay": "5m",
		"reward.staking.delegation.payoutFraction": "0.007",
		"spam.protection.delegation.min.tokens": "1000000000000000000",
		"spam.protection.max.delegations": "390",
		"spam.protection.max.proposals": "100",
		"spam.protection.max.votes": "100",
		"spam.protection.proposal.min.tokens": "1000000000000000000",
		"spam.protection.voting.min.tokens": "1000000000000000000",
		"validators.delegation.minAmount": "100000000000000000",
		"validators.epoch.length": "5s",
		"validators.vote.required": "0.67"
	  },
	  "network_limits": {
		"propose_asset_enabled": true,
		"propose_asset_enabled_from": "2021-09-01T00:00:00Z",
		"propose_market_enabled": true,
		"propose_market_enabled_from": "2021-09-01T00:00:00Z"
	  }
	},
	"consensus_params": {
	  "block": {
		"time_iota_ms": "1"
	  }
	}
}
  EOH

  node_set "validators" {
    count = 2
    mode = "validator"
    node_wallet_pass = "n0d3w4ll3t-p4ssphr4e3"
    vega_wallet_pass = "w4ll3t-p4ssphr4e3"
    ethereum_wallet_pass = "ch41nw4ll3t-3th3r3um-p4ssphr4e3"

    config_templates {

// ============================
// ===== VegaNode Config ======
// ============================

      vega = <<-EOT
[Admin]
  [Admin.Server]
    SocketPath = "/tmp/vega-{{.NodeNumber}}.sock"
    Enabled = true

[API]
	Port = 30{{.NodeNumber}}2
	[API.REST]
			Port = 30{{.NodeNumber}}3

[Blockchain]
	[Blockchain.Tendermint]
		ClientAddr = "tcp://127.0.0.1:266{{.NodeNumber}}7"
		ServerAddr = "0.0.0.0"
		ServerPort = 266{{.NodeNumber}}8
	[Blockchain.Null]
		Port = 31{{.NodeNumber}}1

[EvtForward]
	Level = "Info"
	RetryRate = "1s"
	{{if .FaucetPublicKey}}
	BlockchainQueueAllowlist = ["{{ .FaucetPublicKey }}"]
	{{end}}

[NodeWallet]
	[NodeWallet.ETH]
		Address = "{{.ETHEndpoint}}"

[Processor]
	[Processor.Ratelimit]
		Requests = 10000
		PerNBlocks = 1
EOT

// ============================
// ==== Tendermint Config =====
// ============================

	  tendermint = <<-EOT
log_level = "info"

proxy_app = "tcp://127.0.0.1:266{{.NodeNumber}}8"
moniker = "{{.Prefix}}-{{.TendermintNodePrefix}}"

[rpc]
  laddr = "tcp://0.0.0.0:266{{.NodeNumber}}7"
  unsafe = true
  cors_allowed_origins = ["*"]
  cors-allowed-methods = ["HEAD", "GET", "POST", ]
  cors-allowed-headers = ["Origin", "Accept", "Content-Type", "X-Requested-With", "X-Server-Time", ]

[p2p]
  laddr = "tcp://0.0.0.0:266{{.NodeNumber}}6"
  addr_book_strict = false
  max_packet_msg_payload_size = 4096
  pex = false
  allow_duplicate_ip = true

  persistent_peers = "{{- range $i, $peer := .NodePeers -}}
	  {{- if ne $i 0 }},{{end -}}
	  {{- $peer.ID}}@127.0.0.1:266{{$peer.Index}}6
  {{- end -}}"


[mempool]
  size = 10000
  cache_size = 20000

[consensus]
  skip_timeout_commit = false
EOT
    }
  }

  node_set "full" {
    count = 1
    mode = "full"
	  data_node_binary = "data-node"

    config_templates {

// ============================
// ===== VegaNode Config ======
// ============================

      vega = <<-EOT
[Admin]
  [Admin.Server]
    SocketPath = "/tmp/vega-{{.NodeNumber}}.sock"
    Enabled = true

[API]
	Port = 30{{.NodeNumber}}2
	[API.REST]
			Port = 30{{.NodeNumber}}3

[Blockchain]
	[Blockchain.Tendermint]
		ClientAddr = "tcp://127.0.0.1:266{{.NodeNumber}}7"
		ServerAddr = "0.0.0.0"
		ServerPort = 266{{.NodeNumber}}8
	[Blockchain.Null]
		Port = 31{{.NodeNumber}}1

[EvtForward]
	Level = "Info"
	RetryRate = "1s"

[NodeWallet]
	[NodeWallet.ETH]
		Address = "{{.ETHEndpoint}}"

[Processor]
	[Processor.Ratelimit]
		Requests = 10000
		PerNBlocks = 1

[Broker]
  [Broker.Socket]
    Port = 30{{.NodeNumber}}5
    Enabled = true
EOT

// ============================
// ===== DataNode Config ======
// ============================

      data_node = <<-EOT
GatewayEnabled = true
[SqlStore]
  Port = 5{{.NodeNumber}}32

[API]
  Level = "Info"
  Port = 30{{.NodeNumber}}7
  CoreNodeGRPCPort = 30{{.NodeNumber}}2

[Pprof]
  Level = "Info"
  Enabled = true
  Port = 6{{.NodeNumber}}60
  ProfilesDir = "{{.NodeHomeDir}}"

[Gateway]
  Level = "Info"
  [Gateway.Node]
    Port = 30{{.NodeNumber}}7
  [Gateway.GraphQL]
    Port = 30{{.NodeNumber}}8
  [Gateway.REST]
    Port = 30{{.NodeNumber}}9

[Metrics]
  Level = "Info"
  Timeout = "5s"
  Port = 21{{.NodeNumber}}2
  Enabled = false
[Broker]
  Level = "Info"
  UseEventFile = false
  [Broker.SocketConfig]
    Port = 30{{.NodeNumber}}5
EOT

// ============================
// ==== Tendermint Config =====
// ============================

	  tendermint = <<-EOT
log_level = "info"

proxy_app = "tcp://127.0.0.1:266{{.NodeNumber}}8"
moniker = "{{.Prefix}}-{{.TendermintNodePrefix}}"

[rpc]
  laddr = "tcp://0.0.0.0:266{{.NodeNumber}}7"
  unsafe = true
  cors_allowed_origins = ["*"]
  cors-allowed-methods = ["HEAD", "GET", "POST", ]
  cors-allowed-headers = ["Origin", "Accept", "Content-Type", "X-Requested-With", "X-Server-Time", ]

[p2p]
  laddr = "tcp://0.0.0.0:266{{.NodeNumber}}6"
  addr_book_strict = false
  max_packet_msg_payload_size = 4096
  pex = false
  allow_duplicate_ip = true
  persistent_peers = "{{- range $i, $peer := .NodePeers -}}
	  {{- if ne $i 0 }},{{end -}}
	  {{- $peer.ID}}@127.0.0.1:266{{$peer.Index}}6
  {{- end -}}"

[mempool]
  size = 10000
  cache_size = 20000

[consensus]
  skip_timeout_commit = false
EOT
    }
  }

  smart_contracts_addresses = <<-EOT
{
	"addr0": {
	  "priv": "a37f4c2a678aefb5037bf415a826df1540b330b7e471aa54184877ba901b9ef0",
	  "pub": "0xEe7D375bcB50C26d52E1A4a472D8822A2A22d94F"
	},
	"MultisigControl": {
	  "Ethereum": "0xdEcdA30fd3449718304eA201A8f220eBdE25dd1E"
	},
	"ERC20_Asset_Pool": {
	  "Ethereum": "0xAa1eDb6C25e6B5ff2c8EdAf68757Ae557178E6eE"
	},
	"erc20_bridge_1": {
	  "Ethereum": "0x9708FF7510D4A7B9541e1699d15b53Ecb1AFDc54"
	},
	"erc20_bridge_2": {
	  "Ethereum": "0x29e1eA1cfb78f7c34802C90198Cc24aDcBBE4AD0"
	},
	"tBTC": {
	  "Ethereum": "0xb63D135B0a6854EEb765d69ca36210cC70BECAE0",
	  "Vega": "0x5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c"
	},
	"tDAI": {
	  "Ethereum": "0x879B84eCA313D62CE4e5ED717939B42cBa9e53cb",
	  "Vega": "0x6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61"
	},
	"tEURO": {
	  "Ethereum": "0x7ccE194dAEf2A4e5C23C78C9330D4c907eCA6980",
	  "Vega": "0x8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4"
	},
	"tUSDC": {
	  "Ethereum": "0x1b8a1B6CBE5c93609b46D1829Cc7f3Cb8eeE23a0",
	  "Vega": "0x993ed98f4f770d91a796faab1738551193ba45c62341d20597df70fea6704ede"
	},
	"VEGA": {
	  "Ethereum": "0x67175Da1D5e966e40D11c4B2519392B2058373de",
	  "Vega": "0xb4f2726571fbe8e33b442dc92ed2d7f0d810e21835b7371a7915a365f07ccd9b"
	},
	"VEGAv1": {
	  "Ethereum": "0x8fa21D653C1bF17741055f00dD55663Bc52a8362",
	  "Vega": "0xc1607f28ec1d0a0b36842c8327101b18de2c5f172585870912f5959145a9176c"
	},
	"erc20_vesting": {
	  "Ethereum": "0xF41bD86d462D36b997C0bbb4D97a0a3382f205B7"
	},
	"staking_bridge": {
	  "Ethereum": "0x9135f5afd6F055e731bca2348429482eE614CFfA"
	}
  }
EOT
}
