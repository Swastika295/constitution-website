const cache = new Map();

export default async function handler(req, res) {
  const { topic } = req.query;
  if (!topic) return res.status(400).json({ error: "Missing topic" });

  const key = topic.toLowerCase().trim();
  if (cache.has(key)) {
    return res.status(200).json({ ...cache.get(key), fromCache: true });
  }

  try {
    const resp = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    );
    if (!resp.ok) throw new Error("Not found");
    const data = await resp.json();

    const result = {
      title: data.title || topic,
      summary: data.extract || "",
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`
    };

    cache.set(key, result);
    return res.status(200).json({ ...result, fromCache: false });
  } catch {
    return res.status(404).json({ error: "Topic not found on Wikipedia" });
  }
}
