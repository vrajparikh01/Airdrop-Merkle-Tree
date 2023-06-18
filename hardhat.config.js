require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ethers");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const defaultKey =
  "0000000000000000000000000000000000000000000000000000000000000000";

const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const GOERLI_URL = process.env.GOERLI_URL;
const OPTIMIZER_RUNS = process.env.OPTIMIZER_RUNS;
const OPTIMIZER_FLAG = process.env.OPTIMIZER_FLAG;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
      },
      {
        version: "0.8.18",
      },
    ],
    settings: {
      optimizer: {
        enabled: OPTIMIZER_FLAG || true,
        runs: parseInt(OPTIMIZER_RUNS) || 200,
      },
      evmVersion: "istanbul",
    },
  },

  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
    },
  },

  networks: {
    goerli: {
      url: GOERLI_URL || "",
      accounts: [ACCOUNT_PRIVATE_KEY || defaultKey],
    },
    hardhat: {
      chainID: 31337,
    },
  },

  abiExporter: [
    {
      path: "./abi/json",
      runOnCompile: true,
      clear: true,
      flat: true,
      spacing: 2,
      format: "json",
    },
    {
      path: "./abi/minimal",
      runOnCompile: true,
      clear: true,
      flat: true,
      spacing: 2,
      format: "minimal",
    },
  ],
};
