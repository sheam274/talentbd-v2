/**
 * GET /api/jobs?q=developer&page=1
 * Fetches live jobs from Adzuna API — runs on Vercel serverless.
 * API keys stay on server, never exposed to browser.
 *
 * Query params:
 *   q     — search keyword (default: "developer")
 *   page  — page number (default: 1)
 *
 * Returns: { jobs: [...], total: number }
 */

const ADZUNA_APP_ID  = process.env.ADZUNA_APP_ID
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    // Return empty — frontend will fall back to static BD jobs
    return res.status(200).json({ jobs: [], total: 0, source: 'no-api-key' })
  }

  const q    = req.query.q    || 'developer'
  const page = req.query.page || '1'

  try {
    const params = new URLSearchParams({
      app_id:           ADZUNA_APP_ID,
      app_key:          ADZUNA_API_KEY,
      results_per_page: '10',
      what:             q,
      where:            'Bangladesh',
    })

    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/in/search/${page}?${params}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) {
      // Don't crash — return empty so frontend uses static jobs
      console.warn('[/api/jobs] Adzuna error:', response.status)
      return res.status(200).json({ jobs: [], total: 0, source: 'adzuna-error' })
    }

    const data = await response.json()
    const jobs = (data.results || []).map(job => ({ ...job, source: 'live' }))

    return res.status(200).json({ jobs, total: data.count || 0, source: 'adzuna' })

  } catch (err) {
    console.error('[/api/jobs]', err.message)
    return res.status(200).json({ jobs: [], total: 0, source: 'error', error: err.message })
  }
}
