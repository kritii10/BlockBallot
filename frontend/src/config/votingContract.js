import { ethers } from 'ethers'

export const SEPOLIA_CHAIN_ID = 11155111n
export const VOTING_CONTRACT_ADDRESS = import.meta.env.VITE_VOTING_CONTRACT_ADDRESS || ''

export const VOTING_ABI = [
  'function admin() view returns (address)',
  'function registerVoter(address voter)',
  'function registerCandidate(string name)',
  'function vote(uint256 candidateId)',
  'function getCandidates() view returns ((string name, uint256 voteCount)[])',
  'function getVoteCount(uint256 candidateId) view returns (uint256)',
  'function getWinner() view returns (string winnerName, uint256 winnerVotes)',
]

export function getVotingContract(runner) {
  if (!ethers.isAddress(VOTING_CONTRACT_ADDRESS)) {
    throw new Error('Voting contract address is not configured')
  }

  return new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_ABI, runner)
}

export function isSepoliaNetwork(network) {
  return network.chainId === SEPOLIA_CHAIN_ID
}
