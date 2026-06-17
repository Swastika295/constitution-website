import { useState } from 'react'
import Header from './components/Header'
import Quiz from './components/Quiz'
import PersonaChat from './components/PersonaChat'
import { QUESTIONS, INDIAN_STATES } from './data/questions'

const CATEGORIES = [
  { key: 'constitution', icon: '⚖️', title: 'Constitution', desc: 'Fundamental rights, preamble, articles, amendments' },
  { key: 'states', icon: '🗺️', title: 'States', desc: 'Capitals, area, population, geography' },
  { key: 'governance', icon: '🏛️', title: 'Governance', desc: 'Parliament, judiciary, executive, elections' }
]

const TITLES = { constitution: 'Constitution of India', states: 'States & Union Territories', governance: 'Governance & Politics' }

export default function App() {
  const [view, setView] = useState('home')
  const [category, setCategory] = useState(null)
  const [selectedState, setSelectedState] = useState(null)

  function startQuiz(key) {
    setCategory(key)
    setView('quiz')
  }

  function openState(s) {
    setSelectedState(s)
    setView('persona')
  }

  return (
    <>
      <Header />
      <main>
        {view === 'home' && (
          <section id="categories">
            {CATEGORIES.map(c => (
              <div key={c.key} className="category-card" onClick={() => startQuiz(c.key)}>
                <div className="card-icon">{c.icon}</div>
                <h2>{c.title}</h2>
                <p>{c.desc}</p>
              </div>
            ))}
            <div className="category-card" onClick={() => setView('state-grid')}>
              <div className="card-icon">🧠</div>
              <h2>State Intelligence</h2>
              <p>Dedicated AI personas for every Indian state</p>
            </div>
          </section>
        )}

        {view === 'quiz' && (
          <Quiz questions={QUESTIONS[category]} category={TITLES[category]} onBack={() => setView('home')} />
        )}

        {view === 'state-grid' && (
          <section>
            <div className="quiz-header">
              <button className="btn-secondary" onClick={() => setView('home')}>← Back</button>
              <h3>Select a State</h3>
            </div>
            <div className="state-grid">
              {INDIAN_STATES.map(s => (
                <div key={s.name} className="state-card" onClick={() => openState(s)}>
                  <div className="state-emoji">{s.emoji}</div>
                  <div className="state-name">{s.name}</div>
                  <div className="state-capital">{s.capital}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'persona' && selectedState && (
          <PersonaChat state={selectedState} onBack={() => setView('state-grid')} />
        )}
      </main>
      <footer>
        <p>Data sourced from Wikipedia · Serverless API · Zero-cost architecture</p>
      </footer>
    </>
  )
}
