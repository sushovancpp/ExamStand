import { NextResponse } from 'next/server'

const TOPIC_MAP = {
  reasoning: [
    'Syllogisms',
    'Blood Relations',
    'Coding-Decoding',
    'Puzzles & Seating Arrangement',
    'Direction Sense',
    'Inequalities',
    'Input-Output',
    'Order & Ranking',
    'Alphanumeric Series',
    'Statement & Conclusions',
  ],
  quant: [
    'Number Series',
    'Simplification & Approximation',
    'Data Interpretation',
    'Profit & Loss',
    'Simple & Compound Interest',
    'Time & Work',
    'Speed Distance Time',
    'Ratio & Proportion',
    'Percentage',
    'Quadratic Equations',
  ],
  english: [
    'Reading Comprehension',
    'Error Spotting',
    'Fill in the Blanks',
    'Para Jumbles',
    'Cloze Test',
    'Sentence Improvement',
    'Synonyms & Antonyms',
    'Phrase Replacement',
    'Connectors',
  ],
}

const DIFFICULTY_DESC = {
  Easy:   'straightforward single-step, basic concepts, no tricks, suitable for beginners',
  Medium: '2–3 step reasoning, moderate complexity, standard Prelims level',
  Hard:   'multi-step calculations, complex logical chains, Mains-level difficulty',
}

function buildPrompt({ examType, difficulty, questionsPerSection, sections, totalTime, sectionTime }) {
  const sectionList = sections
    .map((sec, i) => {
      const topics = (TOPIC_MAP[sec.id] || ['General']).slice(0, 5).join(', ')
      return `${i + 1}. name: "${sec.name}", id: "${sec.id}" — topics: ${topics}`
    })
    .join('\n')

  const exampleQuestion = {
    id: 1,
    question: 'Example question text goes here',
    options: ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4'],
    correct: 0,
    difficulty,
    topic: 'Topic Name',
    explanation: 'Brief 1-2 sentence explanation of why the answer is correct.',
  }

  const exampleOutput = {
    meta: {
      title: `${examType} Mock Test`,
      totalTime,
    },
    sections: sections.map((sec) => ({
      name: sec.name,
      id: sec.id,
      time: sectionTime,
      questions: [exampleQuestion],
    })),
  }

  return `You are a professional ${examType} bank exam question setter.

TASK: Generate exactly ${questionsPerSection} questions for each of the ${sections.length} section(s) listed below.

EXAM: ${examType}
DIFFICULTY: ${difficulty} — ${DIFFICULTY_DESC[difficulty]}

SECTIONS TO GENERATE:
${sectionList}

STRICT RULES (follow exactly or output is invalid):
1. Return ONLY valid JSON — zero markdown, no code fences, no text before or after the JSON
2. "correct" field is 0-indexed: 0 = A, 1 = B, 2 = C, 3 = D
3. Each question must have exactly 4 options, each prefixed: "A. " "B. " "C. " "D. "
4. Every question must include all fields: id, question, options, correct, difficulty, topic, explanation
5. Explanations must be concise — 1 to 2 sentences only
6. Questions must be realistic and accurate for ${examType} standard
7. For Quant: include actual numbers and show calculation logic in explanation
8. For Reasoning: include real series, patterns, or logical scenarios
9. For English: use grammatically valid sentences with clear answer justification
10. Do NOT repeat questions across sections
11. Generate exactly ${questionsPerSection} questions per section — no more, no less

EXPECTED JSON STRUCTURE:
${JSON.stringify(exampleOutput, null, 2)}

Now generate the full exam with ${questionsPerSection} questions per section. Return ONLY the JSON.`
}

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      examType,
      difficulty,
      questionsPerSection,
      sections,
      totalTime,
      sectionTime,
    } = body

    // ── Input validation ──
    if (!examType || !difficulty || !questionsPerSection || !sections?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: examType, difficulty, questionsPerSection, sections' },
        { status: 400 }
      )
    }

    // ── API key check ──
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not set. Add it to your .env.local file. Get your key at https://console.groq.com' },
        { status: 500 }
      )
    }

    if (!apiKey.startsWith('gsk_')) {
      return NextResponse.json(
        { error: 'Invalid API key format. Groq keys must start with "gsk_". Check your .env.local file.' },
        { status: 500 }
      )
    }

    // ── Build prompt ──
    const prompt = buildPrompt({
      examType,
      difficulty,
      questionsPerSection,
      sections,
      totalTime: totalTime || 3600,
      sectionTime: sectionTime || Math.round((totalTime || 3600) / sections.length),
    })

    // ── Call Groq API ──
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional bank exam question setter. You always return ONLY valid JSON with no markdown, no code fences, and absolutely no explanation text outside the JSON object.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 14000,
      }),
    })

    // ── Handle Groq HTTP errors ──
    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('Groq API error response:', errText)

      if (groqRes.status === 401) {
        return NextResponse.json(
          { error: 'Groq API key is invalid or expired. Check your .env.local file.' },
          { status: 401 }
        )
      }
      if (groqRes.status === 429) {
        return NextResponse.json(
          { error: 'Groq rate limit hit. Wait a moment and try again, or reduce questions per section.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: `Groq API returned ${groqRes.status}: ${errText.slice(0, 200)}` },
        { status: 502 }
      )
    }

    const groqData = await groqRes.json()
    const content = groqData?.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'Groq returned an empty response. Try again.' },
        { status: 502 }
      )
    }

    // ── Strip accidental markdown fences ──
    const cleaned = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    // ── Parse JSON ──
    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('JSON parse failed. Raw content sample:', content.slice(0, 500))
      return NextResponse.json(
        { error: 'Groq returned malformed JSON. Try again or reduce questions per section.' },
        { status: 502 }
      )
    }

    // ── Validate structure ──
    if (!parsed?.sections || !Array.isArray(parsed.sections)) {
      return NextResponse.json(
        { error: 'Invalid response structure: missing "sections" array.' },
        { status: 502 }
      )
    }

    if (parsed.sections.length !== sections.length) {
      return NextResponse.json(
        {
          error: `Expected ${sections.length} section(s), but got ${parsed.sections.length}. Try again.`,
        },
        { status: 502 }
      )
    }

    // ── Ensure meta block exists ──
    if (!parsed.meta) {
      parsed.meta = {
        title: `${examType} Mock Test`,
        totalTime: totalTime || 3600,
      }
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Unhandled error in /api/generate-questions:', err)
    return NextResponse.json(
      { error: err.message || 'Unknown server error' },
      { status: 500 }
    )
  }
}