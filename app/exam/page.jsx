'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const SECTION_ICONS = { reasoning: '🧠', quant: '📊', english: '📖' }

function fmt(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ExamPage() {
  const router = useRouter()

  const [examData, setExamData] = useState(null)
  const [sections, setSections] = useState([])

  // Navigation
  const [secIdx, setSecIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)

  // Answers & flags — key format: "sectionIndex-questionIndex"
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())

  // Section lifecycle
  const [secDone, setSecDone] = useState([false, false, false])

  // Timers
  const [overallTime, setOverallTime] = useState(3600) // 60 min
  const [secTime, setSecTime] = useState(1200)         // 20 min per section

  // Modals
  const [showSecConfirm, setShowSecConfirm] = useState(false)
  const [showFinalConfirm, setShowFinalConfirm] = useState(false)

  // Refs for stale-closure-free submission
  const answersRef = useRef({})
  const flaggedRef = useRef(new Set())
  const overallRef = useRef(null)
  const secRef = useRef(null)

  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { flaggedRef.current = flagged }, [flagged])

  // ── Load exam data ──
  useEffect(() => {
    const raw = sessionStorage.getItem('examData')
    if (!raw) { router.push('/'); return }
    const parsed = JSON.parse(raw)
    setExamData(parsed)
    setSections(parsed.sections)
  }, [router])

  // ── Submit exam (final) ──
  const submitExam = useCallback(() => {
    clearInterval(overallRef.current)
    clearInterval(secRef.current)
    const data = JSON.parse(sessionStorage.getItem('examData'))
    sessionStorage.setItem('examResults', JSON.stringify({
      examData: data,
      answers: answersRef.current,
      flagged: Array.from(flaggedRef.current),
      timestamp: Date.now(),
    }))
    router.push('/results')
  }, [router])

  // ── Overall timer ──
  useEffect(() => {
    if (!examData) return
    clearInterval(overallRef.current)
    overallRef.current = setInterval(() => {
      setOverallTime(t => {
        if (t <= 1) { clearInterval(overallRef.current); submitExam(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(overallRef.current)
  }, [examData, submitExam])

  // ── Section timer — resets when section changes ──
  useEffect(() => {
    if (!examData) return
    setSecTime(1200)
    clearInterval(secRef.current)
    secRef.current = setInterval(() => {
      setSecTime(t => {
        if (t <= 1) {
          clearInterval(secRef.current)
          // auto-advance section
          setSecIdx(si => {
            const nextSi = si + 1
            setSecDone(prev => { const n = [...prev]; n[si] = true; return n })
            if (nextSi >= sections.length) { submitExam(); return si }
            setQIdx(0)
            return nextSi
          })
          return 1200
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(secRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secIdx, examData])

  // ── Submit current section manually ──
  function confirmSubmitSection() {
    setShowSecConfirm(false)
    clearInterval(secRef.current)
    setSecDone(prev => { const n = [...prev]; n[secIdx] = true; return n })
    const nextSi = secIdx + 1
    if (nextSi >= sections.length) {
      setShowFinalConfirm(true)
    } else {
      setSecIdx(nextSi)
      setQIdx(0)
    }
  }

  // ── Loading ──
  if (!examData || !sections.length) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="w-5 h-5 border-2 border-accent/40 border-t-accent rounded-full animate-spin"></span>
          <span className="font-mono text-sm">Loading exam…</span>
        </div>
      </div>
    )
  }

  const section = sections[secIdx]
  const question = section?.questions[qIdx]
  const ansKey = `${secIdx}-${qIdx}`
  const selected = answers[ansKey]
  const isFlagged = flagged.has(ansKey)
  const totalInSec = section?.questions.length ?? 0
  const answeredInSec = section?.questions.filter((_, qi) => answers[`${secIdx}-${qi}`] !== undefined).length ?? 0

  const secWarn = secTime <= 120
  const overallWarn = overallTime <= 300

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── Top Bar ── */}
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-accent rounded flex items-center justify-center">
            <span className="text-black font-black text-[10px] font-mono">CBT</span>
          </div>
          <span className="text-sm font-semibold hidden sm:block text-white">BankPrep CBT</span>
        </div>

        {/* Timers */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-[10px] text-slate-600 font-mono uppercase">Section</div>
            <div className={`font-mono font-bold text-base leading-tight ${secWarn ? 'timer-warn' : 'text-accent'}`}>
              {fmt(secTime)}
            </div>
          </div>
          <div className="w-px h-7 bg-border"></div>
          <div className="text-center">
            <div className="text-[10px] text-slate-600 font-mono uppercase">Overall</div>
            <div className={`font-mono font-bold text-base leading-tight ${overallWarn ? 'timer-warn' : 'text-white'}`}>
              {fmt(overallTime)}
            </div>
          </div>
        </div>

        {/* Submit All */}
        <button
          onClick={() => setShowFinalConfirm(true)}
          className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/8 text-red-400 hover:bg-red-500/15 transition-colors"
        >
          SUBMIT ALL
        </button>
      </header>

      {/* ── Section Tabs ── */}
      <div className="bg-surface border-b border-border px-2 flex overflow-x-auto">
        {sections.map((sec, si) => {
          const isActive = si === secIdx
          const isDone = secDone[si]
          const isLocked = si > secIdx

          return (
            <button
              key={sec.id}
              disabled={isLocked || isDone}
              onClick={() => { if (!isLocked && !isDone) { setSecIdx(si); setQIdx(0) } }}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'border-accent text-accent'
                  : isDone
                    ? 'border-transparent text-emerald-500 cursor-default'
                    : isLocked
                      ? 'border-transparent text-slate-700 cursor-not-allowed'
                      : 'border-transparent text-slate-400 hover:text-slate-200 cursor-pointer'
              }`}
            >
              <span>{SECTION_ICONS[sec.id] ?? '📝'}</span>
              <span className="hidden sm:inline">{sec.name}</span>
              {isDone && <span className="text-emerald-500 text-xs">✓</span>}
              {isLocked && <span className="text-slate-700 text-xs">🔒</span>}
            </button>
          )
        })}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Question Area ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-2xl mx-auto fade-up">

            {/* Sub-header */}
            <div className="flex items-center justify-between mb-4 text-xs font-mono text-slate-500">
              <span>Q {qIdx + 1} / {totalInSec} &nbsp;·&nbsp; {section.name}</span>
              <span>{answeredInSec} answered</span>
            </div>

            {/* Question card */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 mb-4">
              <div className="flex gap-3 items-start">
                <span className="bg-accent/10 text-accent font-mono font-bold text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                  {qIdx + 1}
                </span>
                <p className="text-slate-100 leading-relaxed text-sm sm:text-base">{question?.question}</p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2.5 mb-6">
              {question?.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers(prev => ({ ...prev, [ansKey]: oi }))}
                  className={`option-btn w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all ${
                    selected === oi
                      ? 'selected border-accent/50 bg-accent/8 text-white'
                      : 'border-border bg-surface text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className={`font-mono font-semibold mr-2.5 text-xs ${selected === oi ? 'text-accent' : 'text-slate-500'}`}>
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  {opt.replace(/^[A-Da-d]\.\s*/, '')}
                </button>
              ))}
            </div>

            {/* Nav Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setQIdx(i => Math.max(0, i - 1))}
                disabled={qIdx === 0}
                className="px-4 py-2.5 border border-border rounded-xl text-sm text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>

              <button
                onClick={() => {
                  setFlagged(prev => {
                    const n = new Set(prev)
                    n.has(ansKey) ? n.delete(ansKey) : n.add(ansKey)
                    return n
                  })
                }}
                className={`px-4 py-2.5 border rounded-xl text-sm transition-all ${
                  isFlagged
                    ? 'border-amber-500/40 bg-amber-500/8 text-amber-400'
                    : 'border-border text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
              >
                🚩 {isFlagged ? 'Flagged' : 'Flag'}
              </button>

              {qIdx < totalInSec - 1 ? (
                <button
                  onClick={() => setQIdx(i => i + 1)}
                  className="px-4 py-2.5 bg-accent text-black font-bold rounded-xl text-sm hover:bg-amber-400 transition-all"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setShowSecConfirm(true)}
                  className="px-4 py-2.5 bg-emerald-500 text-black font-bold rounded-xl text-sm hover:bg-emerald-400 transition-all"
                >
                  Submit Section ✓
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Question Palette Sidebar ── */}
        <aside className="hidden md:flex w-52 bg-surface border-l border-border flex-col p-4 overflow-y-auto">
          <div className="text-[10px] font-mono text-slate-600 mb-3 tracking-widest">QUESTION MAP</div>

          {/* Legend */}
          <div className="space-y-1 mb-4">
            {[
              ['bg-accent', 'Current'],
              ['bg-emerald-500/25 border border-emerald-500/40', 'Answered'],
              ['bg-amber-500/20 border border-amber-500/40', 'Flagged'],
              ['bg-surface2 border border-border', 'Not Visited'],
            ].map(([cls, lbl]) => (
              <div key={lbl} className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className={`w-3 h-3 rounded ${cls} inline-block flex-shrink-0`}></span>
                {lbl}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {section?.questions.map((_, qi) => {
              const k = `${secIdx}-${qi}`
              const isAns = answers[k] !== undefined
              const isFlag = flagged.has(k)
              const isCur = qi === qIdx
              return (
                <button
                  key={qi}
                  onClick={() => setQIdx(qi)}
                  className={`aspect-square rounded text-[11px] font-mono font-semibold transition-all ${
                    isCur
                      ? 'bg-accent text-black'
                      : isFlag
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : isAns
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                          : 'bg-surface2 border border-border text-slate-600 hover:border-slate-500 hover:text-slate-400'
                  }`}
                >
                  {qi + 1}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setShowSecConfirm(true)}
            className="mt-4 w-full py-2 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/8 rounded-lg hover:bg-emerald-500/15 transition-colors"
          >
            Submit Section
          </button>
        </aside>
      </div>

      {/* ── Section Submit Confirm Modal ── */}
      {showSecConfirm && (
        <Modal onClose={() => setShowSecConfirm(false)}>
          <h3 className="font-bold text-white mb-1 text-base">Submit {section?.name}?</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            {answeredInSec}/{totalInSec} answered · {totalInSec - answeredInSec} unanswered.{' '}
            You <span className="text-red-400 font-semibold">cannot return</span> to this section after submitting.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowSecConfirm(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
              Review More
            </button>
            <button onClick={confirmSubmitSection} className="flex-1 py-2.5 bg-emerald-500 text-black font-bold rounded-xl text-sm hover:bg-emerald-400 transition-colors">
              Confirm →
            </button>
          </div>
        </Modal>
      )}

      {/* ── Final Submit Confirm Modal ── */}
      {showFinalConfirm && (
        <Modal onClose={() => setShowFinalConfirm(false)}>
          <h3 className="font-bold text-white mb-1 text-base">⚠ Submit Entire Exam?</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            This will end your exam session and show your final results. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowFinalConfirm(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={submitExam} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-400 transition-colors">
              Submit Exam
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl fade-up"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
