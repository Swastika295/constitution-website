const CACHE_KEY = "constitution_qa_cache"

function loadCache() {
  try {
    const data = localStorage.getItem(CACHE_KEY)
    return data ? JSON.parse(data) : {}
  } catch { return {} }
}

function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) } catch {}
}

function cacheKey(topic) {
  return "wiki_" + topic.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
}

export async function fetchWikipedia(topic) {
  const cache = loadCache()
  const key = cacheKey(topic)
  const cached = cache[key]
  if (cached) return { ...cached, fromCache: true }

  try {
    const resp = await fetch(`/api/wikipedia?topic=${encodeURIComponent(topic)}`)
    if (!resp.ok) throw new Error("Not found")
    const data = await resp.json()
    cache[key] = { title: data.title, summary: data.summary, url: data.url }
    saveCache(cache)
    return { title: data.title, summary: data.summary, url: data.url, fromCache: false }
  } catch {
    return null
  }
}
