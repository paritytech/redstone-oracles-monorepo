import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";
import "@openzeppelin/hardhat-upgrades";
import "@parity/hardhat-polkadot";
import "@typechain/hardhat";
import "dotenv/config";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/config";
import "solidity-coverage";

import dotenv from "dotenv";

import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const { ETH_RPC_BINARY, DEV_NODE_BINARY, RESOLC_BINARY } = process.env;

console.log("✅ Polkadot configuration loaded");
console.log("ETH_RPC_BINARY", ETH_RPC_BINARY);
console.log("DEV_NODE_BINARY", DEV_NODE_BINARY);
console.log("RESOLC_BINARY", RESOLC_BINARY);

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
    },
  },
  mocha: {
    timeout: 100_000,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  networks: {
    hardhat: {
      polkavm: true,
      nodeConfig: {
        nodeBinaryPath: DEV_NODE_BINARY,
        dev: true,
        rpcPort: 8000
      },
      adapterConfig: {
        adapterBinaryPath: ETH_RPC_BINARY,
        dev: true,
      },
    },
    localNode: {
      polkavm: true,
      url: `http://127.0.0.1:8545`,
    },
  },
  // Exclude contracts that use library linking (not supported by resolc)
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    // Explicitly exclude Mento integration contracts that use libraries
    excludeContracts: [
      "contracts/custom-integrations/mento/**/*.sol",
    ],
  },
};

export default config;
