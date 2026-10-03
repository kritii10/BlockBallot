function CandidatesList({ candidates, disabled, isLoading, onVote }) {
  return (
    <section className="panel candidates-panel" aria-labelledby="candidates-title">
      <div className="panel-heading"><p className="eyebrow">Current ballot</p><h2 id="candidates-title">Candidates</h2></div>
      <div className="candidate-list">
        {isLoading && <p className="empty-state">Loading candidates...</p>}
        {!isLoading && candidates.length === 0 && <p className="empty-state">No candidates are registered yet.</p>}
        {candidates.map((candidate) => (
          <article className="candidate-row" key={candidate.id}>
            <div className="candidate-avatar" aria-hidden="true">{candidate.name.charAt(0)}</div>
            <div className="candidate-details"><h3>{candidate.name}</h3><p>{candidate.votes.toString()} votes</p></div>
            <button className="button button-vote" disabled={disabled} type="button" onClick={() => onVote(candidate.id)}>Vote</button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CandidatesList
