import { network } from 'hardhat'

async function deploy() {
  const connection = await network.create()

  try {
    const { ethers } = connection
    const chain = await ethers.provider.getNetwork()
    const voting = await ethers.deployContract('Voting')

    await voting.waitForDeployment()

    console.log(`Network: ${connection.networkName} (chain ID: ${chain.chainId})`)
    console.log(`Voting deployed to: ${await voting.getAddress()}`)
  } finally {
    await connection.close()
  }
}

deploy().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
