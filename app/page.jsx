'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { EXAM_CONFIG, SECTION_TOPICS, formatTime } from '../lib/examConfig'

const EXAMS = Object.keys(EXAM_CONFIG)

function validateExamJSON(data) {
  if (!data?.sections || !Array.isArray(data.sections)) return 'Missing top-level "sections" array'
  if (data.sections.length === 0) return 'Sections array is empty'
  for (const section of data.sections) {
    if (!section.name || !section.id) return 'Each section needs "name" and "id"'
    if (!Array.isArray(section.questions) || section.questions.length === 0)
      return `Section "${section.name}" has no questions`
    for (const q of section.questions) {
      if (!q.question) return `Missing "question" field in "${section.name}"`
      if (!Array.isArray(q.options) || q.options.length !== 4)
        return `Each question needs exactly 4 options (check "${section.name}")`
      if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3)
        return `"correct" must be 0–3 (check "${section.name}")`
    }
  }
  return null
}

// ── Prompt Generator ──────────────────────────────────────────────
function PromptPanel({ exam, stage, config }) {
  const [copied, setCopied] = useState(false)
  const [difficulty, setDifficulty] = useState('Medium')

  const sectionLines = config.sections.map(s => {
    const topics = (SECTION_TOPICS[s.id] || ['General']).slice(0, 5).join(', ')
    return `  - ${s.name}: ${s.questions} questions | Topics: ${topics}`
  }).join('\n')

  const schemaExample = {
    meta: {
      title: `${exam} ${stage} Mock Test`,
      totalTime: config.totalTime,
    },
    sections: config.sections.map(s => ({
      name: s.name,
      id: s.id,
      time: s.time,
      questions: [
        {
          id: 1,
          question: 'Question text here',
          options: ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4'],
          correct: 0,
          difficulty,
          topic: (SECTION_TOPICS[s.id] || ['General'])[0],
          explanation: 'Brief explanation of the correct answer.',
        },
      ],
    })),
  }

  const totalQ = config.sections.reduce((a, s) => a + s.questions, 0)

  const prompt =
`Generate a ${exam} ${stage} mock test in strict JSON. Follow this schema exactly:

${JSON.stringify(schemaExample, null, 2)}

EXAM REQUIREMENTS:
- Exam: ${exam} ${stage}
- Difficulty: ${difficulty}
- Total Questions: ${totalQ}
- Total Time: ${formatTime(config.totalTime)} (${config.totalTime} seconds)
- Sections:
${sectionLines}

STRICT RULES:
1. Return ONLY valid JSON — no markdown, no code fences, no text outside JSON
2. "correct" is 0-indexed: 0=A, 1=B, 2=C, 3=D
3. Exactly 4 options per question, prefixed "A. " "B. " "C. " "D. "
4. Each question must have: id, question, options, correct, difficulty, topic, explanation
5. Explanations must be 1–2 sentences only
6. Questions must match real ${exam} ${stage} standard and syllabus
7. "id" in each section restarts from 1
8. Generate EXACT question counts as specified above — no more, no less`

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="space-y-4">
      {/* Difficulty selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-500">DIFFICULTY:</span>
        <div className="flex gap-2">
          {['Easy', 'Medium', 'Hard'].map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                difficulty === d
                  ? 'bg-accent text-black border-accent'
                  : 'bg-surface2 border-border text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt box */}
      <div className="relative">
        <button
          onClick={handleCopy}
          className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
            copied
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-surface border-border text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          {copied ? '✓ Copied!' : '⎘ Copy Prompt'}
        </button>
        <pre className="bg-surface2 border border-border rounded-xl p-4 pt-12 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
          {prompt}
        </pre>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['1. Copy Prompt', 'Click the button above'],
          ['2. Paste into AI', 'ChatGPT / Claude / Gemini'],
          ['3. Upload JSON', 'Come back & use Upload tab'],
        ].map(([step, desc]) => (
          <div key={step} className="bg-surface2 border border-border rounded-lg px-3 py-2.5">
            <div className="text-xs font-semibold text-accent mb-0.5">{step}</div>
            <div className="text-[10px] text-slate-500 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── JSON Upload Panel ─────────────────────────────────────────────
function UploadPanel({ exam, stage, config, onStart }) {
  const fileRef = useRef(null)
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [jsonValid, setJsonValid] = useState(false)
  const [parsedExam, setParsedExam] = useState(null)

  const totalQ = parsedExam
    ? parsedExam.sections.reduce((a, s) => a + s.questions.length, 0)
    : 0

  function handleJSONChange(text) {
    setJsonInput(text)
    setJsonError('')
    setJsonValid(false)
    setParsedExam(null)
    if (!text.trim()) return
    try {
      const parsed = JSON.parse(text)
      const err = validateExamJSON(parsed)
      if (err) { setJsonError(err); return }
      setParsedExam(parsed)
      setJsonValid(true)
    } catch {
      setJsonError('Invalid JSON — check syntax (missing comma, bracket, or quote)')
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => handleJSONChange(ev.target.result)
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleStart() {
    if (!parsedExam) return
    // Inject exam config times if not already present
    const examObj = {
      ...parsedExam,
      meta: {
        title: parsedExam.meta?.title || `${exam} ${stage} Mock Test`,
        totalTime: config.totalTime,
      },
      sections: parsedExam.sections.map((s, i) => ({
        ...s,
        time: s.time ?? (config.sections[i]?.time ?? Math.round(config.totalTime / parsedExam.sections.length)),
      })),
    }
    onStart(examObj)
  }

  return (
    <div className="space-y-3">
      {/* Expected format hint */}
      <div className="bg-surface2 border border-border rounded-xl px-4 py-3 text-xs font-mono space-y-1">
        <div className="text-slate-500 mb-2">EXPECTED FOR {exam.toUpperCase()} {stage.toUpperCase()}</div>
        {config.sections.map(s => (
          <div key={s.id} className="flex justify-between">
            <span className="text-slate-400">{s.name}</span>
            <span className="text-accent">{s.questions} Q</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-1 mt-1">
          <span className="text-slate-500">Total</span>
          <span className="text-white font-semibold">
            {config.sections.reduce((a, s) => a + s.questions, 0)} Q · {formatTime(config.totalTime)}
          </span>
        </div>
      </div>

      {/* File upload */}
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full border border-dashed border-border rounded-xl py-5 text-center text-xs text-slate-500 hover:border-accent/40 hover:text-accent/80 transition-all"
      >
        <div className="text-2xl mb-1">⬆</div>
        Click to upload <span className="font-mono">.json</span> file
      </button>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-slate-600 font-mono">OR PASTE JSON</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <textarea
        value={jsonInput}
        onChange={e => handleJSONChange(e.target.value)}
        placeholder='{ "meta": { "title": "..." }, "sections": [ ... ] }'
        className="w-full h-28 bg-surface2 border border-border rounded-xl p-3 text-xs font-mono text-slate-300 placeholder-slate-700 resize-none outline-none focus:border-accent/40 transition-colors"
      />

      {jsonError && (
        <div className="text-xs text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">
          ⚠ {jsonError}
        </div>
      )}
      {jsonValid && (
        <div className="text-xs text-emerald-400 bg-emerald-500/8 border border-emerald-500/20 rounded-lg px-3 py-2">
          ✓ Valid — {parsedExam.sections.length} sections · {totalQ} questions loaded
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={!jsonValid}
        className="w-full py-3 rounded-xl font-bold text-sm text-black bg-accent hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Start {exam} {stage} →
      </button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter()

  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedStage, setSelectedStage] = useState(null)
  const [activeTab, setActiveTab] = useState('prompt') // 'prompt' | 'upload'

  function handleSelectExam(exam) {
    setSelectedExam(exam)
    const stages = Object.keys(EXAM_CONFIG[exam].stages)
    setSelectedStage(stages[0]) // auto-select first stage
    setActiveTab('prompt')
  }

  function handleStart(examObj) {
    sessionStorage.setItem('examData', JSON.stringify(examObj))
    router.push('/exam')
  }

  const config = selectedExam && selectedStage
    ? EXAM_CONFIG[selectedExam].stages[selectedStage]
    : null

  const stages = selectedExam ? Object.keys(EXAM_CONFIG[selectedExam].stages) : []

  return (
    <div className="min-h-screen bg-bg grid-bg">

      {/* Header */}
      <header className="border-b border-border/60 px-6 sm:px-10 py-4 flex items-center justify-between sticky top-0 z-10 bg-bg/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-xs font-mono">CBT</span>
          </div>
          <span className="font-bold text-white tracking-tight">
            BankPrep <span className="text-accent">CBT</span>
          </span>
        </div>
        {selectedExam && (
          <button
            onClick={() => { setSelectedExam(null); setSelectedStage(null) }}
            className="text-xs font-mono text-slate-500 hover:text-white border border-border hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Change Exam
          </button>
        )}
      </header>

      {/* ── Step 1: Exam Selection ── */}
      {!selectedExam && (
        <div className="max-w-3xl mx-auto px-6 py-12 fade-up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 border border-border bg-surface rounded-full px-4 py-1.5 text-xs text-slate-400 mb-6 font-mono">
              <span className="text-accent">SBI</span> · <span className="text-accent">IBPS</span> · <span className="text-accent">RRB</span> · FULL CBT SIMULATION
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Which Exam Are You<br />
              <span className="text-accent">Preparing For?</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Select your exam. We'll set the exact syllabus, sections, question counts, and timing automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EXAMS.map(exam => {
              const examStages = Object.keys(EXAM_CONFIG[exam].stages)
              const allSections = Object.values(EXAM_CONFIG[exam].stages)
                .flatMap(s => s.sections)
              const uniqueSections = [...new Set(allSections.map(s => s.name))].length
              return (
                <button
                  key={exam}
                  onClick={() => handleSelectExam(exam)}
                  className="bg-surface border border-border hover:border-accent/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.06)] rounded-2xl p-4 text-left transition-all group"
                >
                  <div className="text-2xl mb-3">🏦</div>
                  <div className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-accent transition-colors">
                    {exam}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    {examStages.join(' · ')}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Step 2 + 3: Stage + Actions ── */}
      {selectedExam && config && (
        <div className="max-w-2xl mx-auto px-6 py-10 fade-up space-y-6">

          {/* Exam title */}
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {selectedExam}
              <span className="text-accent ml-2">{selectedStage}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {config.sections.reduce((a, s) => a + s.questions, 0)} questions · {formatTime(config.totalTime)} · {config.sections.length} sections
            </p>
          </div>

          {/* Stage selector (only if multiple stages) */}
          {stages.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {stages.map(stage => (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    selectedStage === stage
                      ? 'bg-accent text-black border-accent'
                      : 'bg-surface border-border text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          )}

          {/* Exam details card */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <span className="text-xs font-mono text-slate-500 tracking-widest">EXAM PATTERN</span>
            </div>
            <div className="divide-y divide-border">
              {config.sections.map(s => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm text-white font-medium">{s.name}</div>
                    <div className="text-xs text-slate-600 font-mono mt-0.5">
                      {(SECTION_TOPICS[s.id] || []).slice(0, 3).join(', ')}…
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-accent font-mono font-bold text-sm">{s.questions} Q</div>
                    <div className="text-[10px] text-slate-600">{formatTime(s.time)}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-3 bg-surface2">
                <span className="text-sm font-bold text-white">Total</span>
                <div className="text-right">
                  <span className="text-accent font-mono font-bold">
                    {config.sections.reduce((a, s) => a + s.questions, 0)} Q
                  </span>
                  <span className="text-slate-500 font-mono text-xs ml-2">
                    · {formatTime(config.totalTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('prompt')}
                className={`flex-1 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'prompt'
                    ? 'border-accent text-accent bg-accent/5'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                🤖 Generate AI Prompt
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'upload'
                    ? 'border-accent text-accent bg-accent/5'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                📂 Upload JSON
              </button>
            </div>

            <div className="p-5">
              {activeTab === 'prompt' && (
                <PromptPanel
                  exam={selectedExam}
                  stage={selectedStage}
                  config={config}
                />
              )}
              {activeTab === 'upload' && (
                <UploadPanel
                  exam={selectedExam}
                  stage={selectedStage}
                  config={config}
                  onStart={handleStart}
                />
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}