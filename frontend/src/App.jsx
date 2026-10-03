import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import AdminPanel from './components/AdminPanel.jsx'
import CandidatesList from './components/CandidatesList.jsx'
import Header from './components/Header.jsx'
import Results from './components/Results.jsx'
import TransactionStatus from './components/TransactionStatus.jsx'
import { getVotingContract, isSepoliaNetwork } from './config/votingContract.js'
import './App.css'

function App() {
  const hasMetaMask = typeof window !== 'undefined' && Boolean(window.ethereum)
  const [wallet, setWallet] = useState({ address: '', network: '', isSepolia: false })
  const [isConnecting, setIsConnecting] = useState(false)
  const [message, setMessage] = useState(
    hasMetaMask ? 'Connect your MetaMask wallet to get started.' : 'MetaMask is not installed. Install it to connect your wallet.',
  )
  const [messageType, setMessageType] = useState(hasMetaMask ? 'info' : 'error')
  const [candidates, setCandidates] = useState([])
  const [winner, setWinner] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isTransactionPending, setIsTransactionPending] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  function getNetworkLabel(network) {
    return network.name === 'unknown'
      ? `Chain ID ${network.chainId.toString()}`
      : `${network.name} (${network.chainId.toString()})`
  }

  function setWrongNetworkState(address, network) {
    setWallet({ address, network: getNetworkLabel(network), isSepolia: false })
    setCandidates([])
    setWinner(null)
    setIsAdmin(false)
    setMessage('Switch MetaMask to Ethereum Sepolia to use BlockBallot.')
    setMessageType('error')
  }

  async function updateWallet(accounts) {
    if (accounts.length === 0) {
      setWallet({ address: '', network: '', isSepolia: false })
      setMessage('Wallet disconnected.')
      setMessageType('info')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()

      const address = ethers.getAddress(accounts[0])
      if (!isSepoliaNetwork(network)) {
        setWrongNetworkState(address, network)
        return
      }

      setWallet({ address, network: getNetworkLabel(network), isSepolia: true })
      setMessage('Wallet connection updated.')
      setMessageType('success')
      await loadVotingData(address)
    } catch {
      setMessage('Unable to read the updated wallet details.')
      setMessageType('error')
    }
  }

  async function loadVotingData(activeAddress) {
    if (!window.ethereum) return

    setIsLoadingData(true)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      if (!isSepoliaNetwork(network)) {
        setWrongNetworkState(activeAddress, network)
        return
      }
      const contract = getVotingContract(provider)
      const [contractCandidates, adminAddress] = await Promise.all([
        contract.getCandidates(),
        contract.admin(),
      ])
      const candidateData = await Promise.all(
        contractCandidates.map(async (candidate, index) => ({
          id: index,
          name: candidate.name,
          votes: await contract.getVoteCount(index),
        })),
      )

      setCandidates(candidateData)
      setIsAdmin(activeAddress.toLowerCase() === adminAddress.toLowerCase())

      if (candidateData.length > 0) {
        const [name, votes] = await contract.getWinner()
        setWinner({ name, votes })
      } else {
        setWinner(null)
      }
    } catch {
      setCandidates([])
      setWinner(null)
      setIsAdmin(false)
      setMessage('Unable to load voting data. Confirm the selected network and contract address.')
      setMessageType('error')
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    if (!window.ethereum) {
      return undefined
    }

    const handleAccountsChanged = (accounts) => {
      void updateWallet(accounts)
    }
    const handleChainChanged = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        await updateWallet(accounts)
      } catch {
        setMessage('Unable to read the wallet after the network changed.')
        setMessageType('error')
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  async function connectWallet() {
    if (!window.ethereum) {
      setMessage('MetaMask is not installed. Install it to connect your wallet.')
      setMessageType('error')
      return
    }

    setIsConnecting(true)

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      if (!isSepoliaNetwork(network)) {
        setWrongNetworkState(address, network)
        return
      }

      setWallet({ address, network: getNetworkLabel(network), isSepolia: true })
      setMessage('Wallet connected successfully.')
      setMessageType('success')
      await loadVotingData(address)
    } catch (error) {
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        setMessage('Wallet connection was rejected.')
      } else {
        setMessage('Unable to connect to MetaMask. Please try again.')
      }
      setMessageType('error')
    } finally {
      setIsConnecting(false)
    }
  }

  async function sendTransaction(action, transactionFactory) {
    if (!wallet.address) {
      setMessage('Connect your wallet before submitting a transaction.')
      setMessageType('error')
      return
    }

    setIsTransactionPending(true)
    setMessage(`${action} transaction is waiting for confirmation.`)
    setMessageType('info')

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      if (!isSepoliaNetwork(network)) {
        setWrongNetworkState(wallet.address, network)
        return
      }
      const signer = await provider.getSigner()
      const contract = getVotingContract(signer)
      const transaction = await transactionFactory(contract)

      setMessage(`${action} transaction submitted. Waiting to be mined.`)
      await transaction.wait()
      await loadVotingData(wallet.address)
      setMessage(`${action} completed successfully.`)
      setMessageType('success')
    } catch (error) {
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        setMessage(`${action} was rejected in MetaMask.`)
      } else {
        setMessage(`${action} failed. Check your wallet, account permissions, and network.`)
      }
      setMessageType('error')
    } finally {
      setIsTransactionPending(false)
    }
  }

  function registerVoter(voterAddress) {
    if (!ethers.isAddress(voterAddress) || voterAddress === ethers.ZeroAddress) {
      setMessage('Enter a valid voter wallet address.')
      setMessageType('error')
      return
    }

    void sendTransaction('Voter registration', (contract) => contract.registerVoter(voterAddress))
  }

  function registerCandidate(candidateName) {
    if (!candidateName.trim()) {
      setMessage('Enter a candidate name.')
      setMessageType('error')
      return
    }

    void sendTransaction('Candidate registration', (contract) => contract.registerCandidate(candidateName.trim()))
  }

  function castVote(candidateId) {
    void sendTransaction('Vote', (contract) => contract.vote(candidateId))
  }

  return (
    <div className="page-shell">
      <Header
        address={wallet.address}
        isConnecting={isConnecting}
        network={wallet.network}
        onConnect={connectWallet}
      />
      <main className="content">
        <section className="intro">
          <p className="eyebrow">Decentralized community voting</p>
          <h1>Cast your vote with confidence.</h1>
          <p>BlockBallot makes every vote transparent, secure, and easy to verify.</p>
        </section>

        <TransactionStatus isLoading={isConnecting || isLoadingData || isTransactionPending} message={message} type={messageType} />

        <div className="dashboard-grid">
          <AdminPanel
            disabled={!isAdmin || !wallet.isSepolia || isTransactionPending}
            isAdmin={isAdmin}
            onRegisterCandidate={registerCandidate}
            onRegisterVoter={registerVoter}
          />
          <Results winner={winner} />
        </div>

        <CandidatesList
          candidates={candidates}
          disabled={!wallet.address || !wallet.isSepolia || isTransactionPending || isLoadingData}
          isLoading={isLoadingData}
          onVote={castVote}
        />
      </main>
    </div>
  )
}

export default App
