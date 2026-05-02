/**
 * POST /api/analyze-cv
 * Gemini-powered CV analysis — runs on Vercel serverless.
 * API key stays on server, never exposed to browser.
 *
 * Body: { cvText: string }
 * Returns: { score, grade, summary, strengths, improvements,
 *            missing_sections, ats_score, ats_keywords_found,
 *            ats_keywords_missing, weak_phrases }
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' })
  }

  const { cvText } = req.body

  if (!cvText || cvText.trim().length < 20) {
    return res.status(400).json({ error: 'cvText is required (min 20 characters)' })
  }

  const prompt = `You are an expert CV/resume reviewer with 15+ years of hiring experience in Bangladesh and globally.

Analyze the following CV and respond ONLY with valid JSON — no markdown, no backticks, no explanation:
{
  "score": <integer 0-100>,
  "grade": "<A|B|C|D|F>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": [
    { "area": "<area name>", "issue": "<specific issue>", "fix": "<how to fix it>" }
  ],
  "missing_sections": ["<section 1>"],
  "ats_score": <integer 0-100>,
  "ats_keywords_found": ["<keyword 1>", "<keyword 2>"],
  "ats_keywords_missing": ["<keyword 1>", "<keyword 2>"],
  "weak_phrases": ["<phrase 1>", "<phrase 2>"]
}

CV TEXT:
${cvText}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || `Gemini API error ${response.status}`)
    }

    const data = await response.json()
    const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Strip any markdown fences just in case
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let result
    try {
      result = JSON.parse(cleaned)
    } catch {
      throw new Error('Could not parse AI response. Please try again.')
    }

    return res.status(200).json(result)

  } catch (err) {
    console.error('[/api/analyze-cv]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
