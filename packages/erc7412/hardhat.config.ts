import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-viem";
import { HardhatUserConfig } from "hardhat/config";
import "solidity-coverage";

import 'dotenv/config'

if (process.env.ENABLE_POLKADOT === 'true') {
  require("@parity/hardhat-polkadot");
}

const { ETH_RPC_BINARY, DEV_NODE_BINARY, RESOLC_BINARY, ENABLE_POLKADOT } = process.env;

if (process.env.ENABLE_POLKADOT === 'true') {
  console.log("✅ Polkadot configuration loaded");
  console.log("ENABLE_POLKADOT", ENABLE_POLKADOT);
  console.log("ETH_RPC_BINARY", ETH_RPC_BINARY);
  console.log("DEV_NODE_BINARY", DEV_NODE_BINARY);
  console.log("RESOLC_BINARY", RESOLC_BINARY);
}


const config: HardhatUserConfig = {
  solidity: "0.8.17",
  mocha: {
    timeout: 20_000,
  },
  ...(process.env.ENABLE_POLKADOT === 'true' ? {
    resolc: {
      compilerSource: 'binary',
      settings: {
        resolcPath: RESOLC_BINARY,
      }
    }
  } : {}),
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
};

export default config;
