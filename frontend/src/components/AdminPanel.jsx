import { useState } from 'react'

function AdminPanel({ disabled, isAdmin, onRegisterCandidate, onRegisterVoter }) {
  const [voterAddress, setVoterAddress] = useState('')
  const [candidateName, setCandidateName] = useState('')

  function submitVoter(event) {
    event.preventDefault()
    onRegisterVoter(voterAddress)
    setVoterAddress('')
  }

  function submitCandidate(event) {
    event.preventDefault()
    onRegisterCandidate(candidateName)
    setCandidateName('')
  }

  return (
    <section className="panel admin-panel" aria-labelledby="admin-title">
      <div className="panel-heading"><p className="eyebrow">Admin controls</p><h2 id="admin-title">Manage election</h2></div>
      {!isAdmin && <p className="admin-note">Connect with the contract admin account to manage the election.</p>}
      <form onSubmit={submitVoter}>
        <label htmlFor="voter-address">Register voter</label>
        <div className="input-row">
          <input disabled={disabled} id="voter-address" value={voterAddress} onChange={(event) => setVoterAddress(event.target.value)} placeholder="0x wallet address" />
          <button className="button button-secondary" disabled={disabled} type="submit">Register</button>
        </div>
      </form>
      <form onSubmit={submitCandidate}>
        <label htmlFor="candidate-name">Register candidate</label>
        <div className="input-row">
          <input disabled={disabled} id="candidate-name" value={candidateName} onChange={(event) => setCandidateName(event.target.value)} placeholder="Candidate name" />
          <button className="button button-secondary" disabled={disabled} type="submit">Add</button>
        </div>
      </form>
    </section>
  )
}

export default AdminPanel
