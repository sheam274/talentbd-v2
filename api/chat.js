/**
 * POST /api/chat
 * Gemini-powered TalentBot — runs on Vercel serverless.
 * API key stays on server, never exposed to browser.
 *
 * Body: { messages: [{role, content}], message: string }
 * Returns: { reply: string }
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY

const SYSTEM = `You are TalentBot, the friendly AI career assistant for TalentBD — Bangladesh's #1 job and career platform.

Help users with:
- Jobs in Bangladesh (tech, finance, design, marketing, etc.)
- CV writing tips and ATS optimization for BD market
- Interview preparation for Bangladeshi companies
- Career guidance for fresh CSE graduates
- Salary ranges in Bangladesh (always use ৳ BDT)
- TalentBD features: CV Builder, CV Analyzer, Learning Hub, Live Jobs

Tone: Friendly, concise (under 150 words unless complex), practical.
Occasionally greet with "Assalamu Alaikum" or "Shuvo Din".
Use bullet points for lists. Always recommend relevant TalentBD tools when helpful.`

export default async function handler(req, res) {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' })
  }

  try {
    const { messages = [], message } = req.body

    if (!message) {
      return res.status(400).json({ error: 'message is required' })
    }

    // Build Gemini contents from history
    const contents = [
      ...messages.map(m => ({
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || `Gemini API error ${response.status}`)
    }

    const data  = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!reply) throw new Error('Empty response from Gemini')

    return res.status(200).json({ reply })

  } catch (err) {
    console.error('[/api/chat]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
