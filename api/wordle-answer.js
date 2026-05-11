export default async function handler(req, res) {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date' });
  }
  try {
    const r = await fetch(`https://www.nytimes.com/svc/wordle/v2/${date}.json`);
    if (!r.ok) return res.status(r.status).json({ error: 'NYT API error' });
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.json({ solution: data.solution });
  } catch {
    res.status(502).json({ error: 'Failed to reach NYT' });
  }
}
