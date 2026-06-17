import { useState, useMemo } from 'react'
import { fetchWikipedia } from '../utils/wikipedia'

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function Quiz({ questions, category, onBack }) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [done, setDone] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [wiki, setWiki] = useState(null)
  const shuffled = useMemo(() => shuffle([...questions]), [questions])

  const q = shuffled[index]

  async function handleSelect(idx) {
    if (selected !== null) return
    setSelected(idx)
    setAnswered(a => a + 1)
    if (idx === q.answer) setScore(s => s + 1)
    setLoading(true)
    const w = await fetchWikipedia(q.wikiTopic)
    setWiki(w)
    setLoading(false)
  }

  function next() {
    if (index + 1 >= shuffled.length) { setDone(true); return }
    setIndex(i => i + 1)
    setSelected(null)
    setWiki(null)
  }

  if (done) {
    const pct = Math.round((score / shuffled.length) * 100)
    const grade = pct >= 90 ? 'Excellent' : pct >= 70 ? 'Great' : pct >= 50 ? 'Good' : 'Keep Learning'
    return (
      <section>
        <div className="quiz-header"><button className="btn-secondary" onClick={onBack}>← Back</button><h3>Quiz Complete!</h3></div>
        <div className="card">
          <p style={{ fontSize: '1.2rem' }}><strong>{grade}!</strong> You scored <strong>{score}/{shuffled.length}</strong> ({pct}%)</p>
          <br /><button className="btn-primary" onClick={onBack}>← Back to Categories</button>
        </div>
      </section>
    )
  }

  if (!q) return null

  return (
    <section>
      <div className="quiz-header">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <h3>{category}</h3>
        <span className="score">Score: {score} / {answered}</span>
      </div>
      <div className="card">
        {loading && <div className="spinner-wrap"><div className="spinner" /><p>Fetching from Wikipedia...</p></div>}
        <p className="qtext">{q.question}</p>
        <div className="options">
          {q.options.map((opt, i) => {
            let cls = 'opt-btn'
            if (selected !== null) cls += ' disabled'
            if (selected !== null && i === q.answer) cls += ' correct'
            if (selected === i && i !== q.answer) cls += ' wrong'
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={selected !== null}>
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            )
          })}
        </div>
        {selected !== null && !loading && (
          <div className="result">
            <p>{selected === q.answer ? '✅ Correct! ' : '❌ Incorrect. '}{q.explanation}</p>
            {wiki && (
              <div className="wiki-box">
                <strong>Source:</strong> {wiki.summary?.substring(0, 300)}{wiki.summary?.length > 300 ? '...' : ''}
                <a href={wiki.url} target="_blank" rel="noreferrer"> Read on Wikipedia →</a>
              </div>
            )}
            {wiki?.fromCache && <div className="cache-badge">⚡ Answered from cache</div>}
            <button className="btn-primary" onClick={next} style={{ marginTop: '1rem' }}>
              {index + 1 >= shuffled.length ? 'See Results' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
