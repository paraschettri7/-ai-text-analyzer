import { useState } from 'react'

const examples = [
  'A product review',
  'A customer email',
  'A meeting note',
]

function SparkleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 15 .9 3.1L23 19l-3.1.9L19 23l-.9-3.1L15 19l3.1-.9L19 15Z" /></svg>
}

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function analyze(event) {
    event.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || `The analysis request failed (${response.status}).`)
      }
      if (!data.sentiment || !data.summary || !Array.isArray(data.keywords)) {
        throw new Error('The server returned an unexpected response. Please try again.')
      }
      setResult(data)
    } catch (err) {
      setError(err instanceof TypeError
        ? 'Could not connect to the analyzer. Check that the backend is running on port 3000, then try again.'
        : err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const sentiment = result?.sentiment?.toLowerCase()

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Clarity home">
          <span className="brand-mark"><SparkleIcon /></span>
          <span>clarity<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-note"><span className="status-dot" /> AI-powered text insights</div>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span className="eyebrow-line" /> YOUR WORDS, UNDERSTOOD</div>
        <h1>Make sense of<br /><span>what you read.</span></h1>
        <p className="hero-copy">Get the feeling, the gist, and the key ideas — all in one clear view.</p>
      </section>

      <section className="workspace" aria-label="Text analysis">
        <form className="input-card" onSubmit={analyze}>
          <div className="card-heading">
            <div>
              <span className="step-label">01 <span>·</span> YOUR TEXT</span>
              <h2>What would you like to understand?</h2>
            </div>
            <span className="private-label"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5 7V5a3 3 0 0 1 6 0v2" /></svg> Private by design</span>
          </div>
          <label className="sr-only" htmlFor="analysis-text">Text to analyze</label>
          <textarea
            id="analysis-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste an article, message, review, or any piece of writing here..."
            maxLength={12000}
            aria-describedby="text-count"
          />
          <div className="input-footer">
            <span id="text-count">{wordCount} {wordCount === 1 ? 'word' : 'words'} <span className="count-separator">·</span> {text.length.toLocaleString()} / 12,000 characters</span>
            <button className="analyze-button" type="submit" disabled={!text.trim() || loading}>
              {loading ? <><span className="spinner" /> Reading your text</> : <><SparkleIcon /> Analyze text <span className="button-arrow">↗</span></>}
            </button>
          </div>
          {error && <div className="error-message" role="alert"><span className="error-icon">!</span><span>{error}</span></div>}
        </form>

        {!result && !loading && !error && (
          <div className="hint-row"><span className="hint-icon">✳</span><span>Works best with a few sentences or more</span><span className="hint-divider" />
            <span className="try-label">Try it with</span>{examples.map((example) => <span className="example-chip" key={example}>{example}</span>)}
          </div>
        )}

        {loading && (
          <div className="loading-card" role="status"><span className="loading-orbit"><SparkleIcon /></span><div><strong>Finding the meaning in your words</strong><p>Looking at tone, themes, and the details that matter.</p></div><span className="loading-dots"><i /><i /><i /></span></div>
        )}

        {result && (
          <section className="results" aria-live="polite" aria-label="Analysis results">
            <div className="results-header"><div><span className="step-label">02 <span>·</span> THE READOUT</span><h2>Here’s the picture.</h2></div><span className="complete-label"><span /> Analysis complete</span></div>
            <div className="result-grid">
              <article className="result-card sentiment-card">
                <span className="result-kicker">THE FEELING</span>
                <div className={`sentiment-value sentiment-${sentiment}`}><span className="sentiment-symbol">{sentiment === 'positive' ? '↗' : sentiment === 'negative' ? '↘' : '→'}</span>{result.sentiment}</div>
                <p className="result-caption">Overall sentiment</p>
                <div className={`sentiment-track track-${sentiment}`}><span /></div>
              </article>
              <article className="result-card summary-card"><span className="result-kicker">THE GIST</span><p className="summary-text">{result.summary}</p><div className="card-bottom-note"><span className="tiny-sparkle">✳</span> A concise summary</div></article>
              <article className="result-card keywords-card"><span className="result-kicker">THE KEY IDEAS</span><div className="keyword-list">{result.keywords.length ? result.keywords.map((keyword, index) => <span className="keyword" key={`${keyword}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span>{keyword}</span>) : <p className="empty-keywords">No keywords found.</p>}</div><div className="card-bottom-note"><span className="tiny-sparkle">✳</span> {result.keywords.length} key {result.keywords.length === 1 ? 'idea' : 'ideas'} identified</div></article>
            </div>
            <button className="reset-button" type="button" onClick={() => { setResult(null); setText(''); setError('') }}>Analyze another text <span>↗</span></button>
          </section>
        )}
      </section>

      <footer className="footer"><span>CLARITY <span className="brand-dot">.</span></span><span>Less noise. More meaning.</span></footer>
    </main>
  )
}

export default App
