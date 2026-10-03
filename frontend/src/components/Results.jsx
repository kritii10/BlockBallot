function Results({ winner }) {
  return (
    <section className="panel result-panel" aria-labelledby="results-title">
      <p className="eyebrow">Live result</p>
      <h2 id="results-title">Current winner</h2>
      <div className="winner-card">
        <span className="trophy" aria-hidden="true">★</span>
        <p className="winner-name">{winner ? winner.name : 'No result yet'}</p>
        <p className="winner-count">{winner ? winner.votes.toString() : '0'} <span>winning votes</span></p>
      </div>
    </section>
  )
}

export default Results
