import { hardhatNetworksConfig } from "@redstone-finance/rpc-providers";
import { HardhatUserConfig } from "hardhat/config";

// PLUGINS
import "@gelatonetwork/web3-functions-sdk/hardhat-plugin";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-deploy";
// Conditionally import Polkadot plugin only when explicitly enabled
if (process.env.ENABLE_POLKADOT === 'true') {
  require("@parity/hardhat-polkadot");
}

// ================================= TASKS =========================================
// Process Env Variables
import "dotenv/config";
// Libraries

const { ETH_RPC_BINARY, DEV_NODE_BINARY, RESOLC_BINARY } = process.env;

if (process.env.ENABLE_POLKADOT === 'true') {
  console.log("✅ Polkadot configuration loaded");
  console.log("ETH_RPC_BINARY", ETH_RPC_BINARY);
  console.log("DEV_NODE_BINARY", DEV_NODE_BINARY);
  console.log("RESOLC_BINARY", RESOLC_BINARY);
}

process.env.DENO_PATH = "./../../node_modules/deno-bin/bin/deno";

// Process Env Variables - an empty ID might lead to a "Must be authorized" error.
const ALCHEMY_ID = process.env.ALCHEMY_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;

// ================================= CONFIG =========================================
const config: HardhatUserConfig = {
  w3f: {
    rootDir: "./web3-functions",
    debug: true,
    networks: process.env.ENABLE_POLKADOT === 'true' 
      ? ["hardhat", "polkadot"] // Gelato needs both entries to handle both chainIds
      : ["hardhat"],
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
  },

  defaultNetwork: "hardhat",
  ...(process.env.ENABLE_POLKADOT === 'true' ? {
    resolc: {
      compilerSource: 'binary',
      settings: {
        resolcPath: RESOLC_BINARY,
      }
    }
  } : {}),
  networks: {
    ...hardhatNetworksConfig(PRIVATE_KEY ? [PRIVATE_KEY] : []),
    hardhat: process.env.ENABLE_POLKADOT === 'true' ? {
      polkavm: true,
      chainId: 420420420, // Explicitly set the Polkadot chainId
      nodeConfig: {
        nodeBinaryPath: DEV_NODE_BINARY,
        dev: true,
        rpcPort: 8000
      },
      adapterConfig: {
        adapterBinaryPath: ETH_RPC_BINARY,
        dev: true,
      },
    } : {
      // Standard Hardhat network config for tests
      chainId: 31337,
    },
    // This "polkadot" entry is just to tell Gelato SDK about chainId 420420420
    // It's actually the same network as "hardhat" when polkavm is enabled
    polkadot: {
      chainId: 420420420,
      url: "http://127.0.0.1:8545",
    },
    localNode: {
      polkavm: true,
      url: `http://127.0.0.1:8545`,
    },
  },

  verify: {
    etherscan: {
      apiKey: ETHERSCAN_KEY ?? "",
    },
  },

  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: { enabled: true },
        },
      },
    ],
  },

  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
