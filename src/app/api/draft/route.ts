// The only server-side endpoint in the app. Receives a minimised draft payload
// (no address, no email, no eligibility answers), returns a worded draft.
// Nothing is persisted server-side; the API key never reaches the client.

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { DRAFT_SYSTEM_PROMPT, buildDraftUserMessage, DraftPayload } from '@/lib/draft-prompts'

export const runtime = 'nodejs'

const VALID_KINDS = ['re_complaint', 'reminder', 'gro_escalation', 'pno_escalation']

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ai_unavailable', message: 'AI drafting is not configured. Use the template fallback.' },
      { status: 503 }
    )
  }

  let payload: DraftPayload
  try {
    payload = (await req.json()) as DraftPayload
    if (!VALID_KINDS.includes(payload.docKind) || !Array.isArray(payload.grounds)) {
      throw new Error('bad shape')
    }
  } catch {
    return NextResponse.json({ error: 'bad_request', message: 'Invalid draft payload.' }, { status: 400 })
  }

  const client = new Anthropic()
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      system: DRAFT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildDraftUserMessage(payload) }],
    })
    const draft = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
    if (!draft) {
      return NextResponse.json(
        { error: 'empty_draft', message: 'The model returned no draft. Use the template fallback.' },
        { status: 502 }
      )
    }
    return NextResponse.json({ draft })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Drafting is rate-limited right now — retry in a minute or use the template fallback.' },
        { status: 429 }
      )
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'api_error', message: 'AI drafting failed. Use the template fallback.' },
        { status: 502 }
      )
    }
    return NextResponse.json(
      { error: 'unknown', message: 'AI drafting failed unexpectedly. Use the template fallback.' },
      { status: 500 }
    )
  }
}
