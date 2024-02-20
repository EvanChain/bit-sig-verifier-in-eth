import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { NetworksUserConfig } from "hardhat/types"
import { config as dotenvConfig } from "dotenv"
import { resolve } from "path"

dotenvConfig({ path: resolve(__dirname, ".env") })

function getNetworks(): NetworksUserConfig {
  if (!process.env.INFURA_API_KEY || !process.env.ETHEREUM_PRIVATE_KEY) {
      return {}
  }

  const accounts = [`0x${process.env.ETHEREUM_PRIVATE_KEY}`]
  const infuraApiKey = process.env.INFURA_API_KEY
  const arbApiKey = process.env.ARB_API_KEY

  return {
      goerli: {
          url: `https://goerli.infura.io/v3/${infuraApiKey}`,
          chainId: 5,
          accounts
      },
      sepolia: {
          url: `https://sepolia.infura.io/v3/${infuraApiKey}`,
          chainId: 11155111,
          accounts
      },
      mumbai: {
          url: `https://polygon-mumbai.infura.io/v3/${infuraApiKey}`,
          chainId: 80001,
          accounts
      },
      "optimism-goerli": {
          url: `https://optimism-goerli.infura.io/v3/${infuraApiKey}`,
          chainId: 420,
          accounts
      },
      "arbitrum-goerli": {
          url: "https://goerli-rollup.arbitrum.io/rpc",
          chainId: 421613,
          accounts
      },
      arbitrum: {
          url: `https://arb-mainnet.g.alchemy.com/v2/${arbApiKey}`,
          chainId: 42161,
          accounts
      },
  }
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  typechain: {
    outDir: "./build/typechain",
    target: "ethers-v6"
  },
  networks: {
    hardhat: {
        chainId: 1337
    },
    ...getNetworks()
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
};

export default config;
