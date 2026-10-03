import 'dotenv/config'
import hardhatEthers from '@nomicfoundation/hardhat-ethers'
import hardhatMocha from '@nomicfoundation/hardhat-mocha'
import { configVariable, defineConfig } from 'hardhat/config'

export default defineConfig({
  solidity: '0.8.28',
  plugins: [hardhatEthers, hardhatMocha],
  networks: {
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('SEPOLIA_RPC_URL'),
      accounts: [configVariable('PRIVATE_KEY')],
    },
  },
})
