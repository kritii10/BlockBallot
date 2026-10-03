function TransactionStatus({ isLoading, message, type }) {
  return (
    <section className={`transaction-status ${type}`} aria-live="polite">
      <span className={`status-dot ${isLoading ? 'loading' : ''}`} aria-hidden="true"></span>
      <div><strong>{isLoading ? 'Connecting wallet' : 'Transaction status'}</strong><p>{message}</p></div>
    </section>
  )
}

export default TransactionStatus
