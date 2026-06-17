import { useState, useEffect, useRef } from 'react'
import { fetchWikipedia } from '../utils/wikipedia'

function generateResponse(state, question, wiki) {
  const q = question.toLowerCase()
  const { name, capital } = state
  const summary = wiki?.summary || ''
  const sentences = summary.match(/[^.]*\./g)?.filter(s => s.trim().length > 20) || []

  if (/population|people|how many/i.test(q)) {
    const m = summary.match(/(?:population|people)[^.]*/i)
    return m ? `Regarding population: ${m[0]}. \n\nSource: Wikipedia` : `Let me check. ${sentences[0] || ''}`
  }
  if (/history|founded|origin/i.test(q)) {
    const m = summary.match(/(?:history|founded|established|ancient|kingdom|dynasty)[^.]*/i)
    return m ? `History: ${m[0]}. \n\nSource: Wikipedia` : `${name} has a rich history. ${sentences.slice(0, 2).join('. ')}`
  }
  if (/culture|language|food|festival|dance/i.test(q)) {
    const m = summary.match(/(?:culture|language|tradition|festival|dance|music)[^.]*/i)
    return m ? `Culture: ${m[0]}. \n\nSource: Wikipedia` : `${name} has a vibrant culture! ${sentences.slice(0, 2).join('. ')}`
  }
  if (/area|size|geography|kilomet/i.test(q)) {
    const m = summary.match(/(?:area|km²|square|geography)[^.]*/i)
    return m ? `Geography: ${m[0]}. \n\nSource: Wikipedia` : `${name} covers a significant area. ${sentences[0] || ''}`
  }
  if (/economy|gdp|industry|agriculture|business/i.test(q)) {
    const m = summary.match(/(?:economy|gdp|industry|agriculture|business|trade)[^.]*/i)
    return m ? `Economy: ${m[0]}. \n\nSource: Wikipedia` : `${name} contributes significantly to India's economy. ${sentences.slice(0, 2).join('. ')}`
  }
  if (/tourism|travel|visit|place/i.test(q)) {
    const m = summary.match(/(?:tourism|tourist|destination|temple|palace|monument|beach|hill)[^.]*/i)
    return m ? `Tourism: ${m[0]}. \n\nSource: Wikipedia` : `${name} has many beautiful places to visit! ${sentences.slice(0, 2).join('. ')}`
  }
  if (/capital/i.test(q)) return `The capital of ${name} is ${capital}. ${sentences[0] || ''}`
  if (/who|famous|known for/i.test(q)) {
    const m = summary.match(/(?:known for|famous|notable)[^.]*/i)
    return m ? `${name} is known for: ${m[0]}. \n\nSource: Wikipedia` : `${name} is renowned for its heritage. ${sentences[0] || ''}`
  }

  if (sentences.length > 0) {
    return `Here's what I know about ${name}:\n\n${sentences.slice(0, 2).join('. ')}${sentences.length > 2 ? '...' : '.'}\n\nAsk about history, culture, economy, tourism, and more!`
  }
  return `I'm the ${name} AI. Ask me about the capital (${capital}), history, culture, economy, or geography.`
}

export default function PersonaChat({ state, onBack }) {
  const [wiki, setWiki] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [fetching, setFetching] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    (async () => {
      const w = await fetchWikipedia(state.wikiTopic)
      setWiki(w)
      setLoading(false)
      setMessages([{ role: 'persona', text: `Namaste! I am the ${state.name} AI. Ask me anything about ${state.name} — its history, culture, geography, or economy. I draw my knowledge from Wikipedia.` }])
    })()
  }, [state])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || fetching) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text }])
    setFetching(true)
    setMessages(m => [...m, { role: 'persona', text: '...', id: 'thinking' }])
    const w = wiki || await fetchWikipedia(state.wikiTopic)
    if (!wiki) setWiki(w)
    const resp = generateResponse(state, text, w)
    setMessages(m => m.filter(msg => msg.id !== 'thinking').concat({ role: 'persona', text: resp }))
    setFetching(false)
  }

  return (
    <section>
      <div className="quiz-header">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <h3>{state.emoji} {state.name}</h3>
        {wiki?.fromCache && <span className="badge badge-cache">Cached Knowledge</span>}
      </div>
      <div className="card">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /><p>Loading state intelligence...</p></div>
        ) : (
          <>
            <div className="persona-hdr">
              <div className="avatar">{state.emoji}</div>
              <div><h2>{state.name}</h2><p>Capital: {state.capital}</p></div>
            </div>
            {wiki?.summary && (
              <div className="wiki-box" style={{ marginBottom: '1rem' }}>
                <strong>About:</strong> {wiki.summary.substring(0, 250)}{wiki.summary.length > 250 ? '...' : ''}
                <a href={wiki.url} target="_blank" rel="noreferrer"> Read on Wikipedia →</a>
              </div>
            )}
            <div className="chat">
              <div className="chat-msgs">
                {messages.map((msg, i) => (
                  <div key={i} className={`chat-msg ${msg.role}`} style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="chat-input">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about this state..." disabled={fetching} />
                <button className="btn-primary" onClick={send} disabled={fetching}>Ask</button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
