function Header({ address, isConnecting, network, onConnect }) {
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="BlockBallot home">
        <span className="brand-icon" aria-hidden="true">B</span>
        <span>BlockBallot</span>
      </a>
      <div className="wallet-area">
        <div className="wallet-details">
          <span className="wallet-address">Wallet: {shortAddress}</span>
          {network && <span className="network-name">Network: {network}</span>}
        </div>
        <button className="button button-primary" type="button" onClick={onConnect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      </div>
    </header>
  )
}

export default Header
