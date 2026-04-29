'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function calcScore(examData, answers) {
  let total = 0, correct = 0, wrong = 0, skipped = 0
  const sectionScores = {}

  examData.sections.forEach((section, sIdx) => {
    let sScore = 0, sCorrect = 0, sWrong = 0, sSkipped = 0
    section.questions.forEach((q, qIdx) => {
      const key = `${sIdx}-${qIdx}`
      const ans = answers[key]
      if (ans === undefined || ans === null) {
        skipped++; sSkipped++
      } else if (ans === q.correct) {
        correct++; sCorrect++; total += 1; sScore += 1
      } else {
        wrong++; sWrong++; total -= 0.25; sScore -= 0.25
      }
    })
    sectionScores[section.id] = {
      score: sScore,
      correct: sCorrect,
      wrong: sWrong,
      skipped: sSkipped,
      total: section.questions.length,
    }
  })

  const maxScore = examData.sections.reduce((a, s) => a + s.questions.length, 0)
  return { total, correct, wrong, skipped, sectionScores, maxScore }
}

function ScoreBadge({ score, maxScore }) {
  const pct = Math.max(0, (score / maxScore) * 100)
  const grade =
    pct >= 80 ? ['Excellent', 'text-emerald-400'] :
    pct >= 60 ? ['Good', 'text-accent'] :
    pct >= 40 ? ['Average', 'text-yellow-500'] :
    ['Needs Work', 'text-red-400']

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-6xl sm:text-7xl font-black font-mono text-white mb-1 tracking-tighter">
        {score > 0 ? '+' : ''}{score.toFixed(2)}
      </div>
      <div className="text-slate-500 font-mono text-sm mb-3">out of {maxScore}</div>
      <span className={`text-sm font-semibold ${grade[1]}`}>{grade[0]}</span>
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState(null)
  const [score, setScore] = useState(null)
  const [reviewSec, setReviewSec] = useState(0)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('examResults')
    if (!raw) { router.push('/'); return }
    const parsed = JSON.parse(raw)
    setResults(parsed)
    setScore(calcScore(parsed.examData, parsed.answers))
  }, [router])

  if (!results || !score) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="font-mono text-slate-400 text-sm">Loading results…</span>
      </div>
    )
  }

  const { examData, answers } = results
  const pct = Math.max(0, Math.min(100, (score.total / score.maxScore) * 100)).toFixed(1)
  const accuracy = score.correct + score.wrong > 0
    ? ((score.correct / (score.correct + score.wrong)) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-bg grid-bg">

      {/* ── Header ── */}
      <header className="border-b border-border/60 px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-[10px] font-mono">CBT</span>
          </div>
          <span className="font-bold text-white">BankPrep <span className="text-accent">CBT</span></span>
          <span className="text-slate-600 text-sm hidden sm:inline">— Results</span>
        </div>
        <button
          onClick={() => { sessionStorage.clear(); router.push('/') }}
          className="text-xs font-mono border border-border text-slate-500 hover:text-white hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
        >
          NEW EXAM
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5 fade-up">

        {/* ── Score Hero Card ── */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <ScoreBadge score={score.total} maxScore={score.maxScore} />
            <div className="space-y-3">
              {[
                { label: 'Correct', value: score.correct, cls: 'text-emerald-400' },
                { label: 'Wrong', value: score.wrong, cls: 'text-red-400' },
                { label: 'Skipped', value: score.skipped, cls: 'text-slate-400' },
                { label: 'Accuracy', value: accuracy + '%', cls: 'text-accent' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-mono font-bold text-lg ${cls}`}>{value}</span>
                </div>
              ))}
              {/* Score bar */}
              <div className="pt-1">
                <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-right text-xs text-slate-600 font-mono mt-1">{pct}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section Breakdown ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {examData.sections.map((sec, sIdx) => {
            const ss = score.sectionScores[sec.id]
            const secAcc = ss.correct + ss.wrong > 0
              ? ((ss.correct / (ss.correct + ss.wrong)) * 100).toFixed(0)
              : 0
            return (
              <div key={sec.id} className="bg-surface border border-border rounded-xl p-4">
                <div className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">{sec.name}</div>
                <div className="font-mono text-3xl font-black text-accent mb-3">
                  {ss.score > 0 ? '+' : ''}{ss.score.toFixed(2)}
                </div>
                <div className="text-xs space-y-1">
                  {[
                    ['Correct', ss.correct, 'text-emerald-400'],
                    ['Wrong', ss.wrong, 'text-red-400'],
                    ['Skipped', ss.skipped, 'text-slate-500'],
                    ['Accuracy', secAcc + '%', 'text-accent'],
                  ].map(([k, v, cls]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-600">{k}</span>
                      <span className={`font-mono font-semibold ${cls}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Answer Review ── */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-bold text-white text-sm">Answer Review</h2>
            <button
              onClick={() => setShowReview(v => !v)}
              className="text-xs font-mono text-accent border border-accent/30 px-3 py-1.5 rounded-lg hover:bg-accent/8 transition-colors"
            >
              {showReview ? '▲ HIDE' : '▾ SHOW ALL'}
            </button>
          </div>

          {showReview && (
            <>
              {/* Section Tabs */}
              <div className="flex border-b border-border overflow-x-auto">
                {examData.sections.map((sec, si) => (
                  <button
                    key={sec.id}
                    onClick={() => setReviewSec(si)}
                    className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                      reviewSec === si ? 'border-accent text-accent' : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>

              {/* Questions */}
              <div className="p-4 sm:p-5 space-y-4 max-h-[620px] overflow-y-auto">
                {examData.sections[reviewSec].questions.map((q, qi) => {
                  const key = `${reviewSec}-${qi}`
                  const userAns = answers[key]
                  const isSkipped = userAns === undefined || userAns === null
                  const isCorrect = !isSkipped && userAns === q.correct

                  return (
                    <div
                      key={qi}
                      className={`border rounded-xl p-4 ${
                        isSkipped ? 'border-border' :
                        isCorrect ? 'border-emerald-500/25' :
                        'border-red-500/25'
                      }`}
                    >
                      {/* Question header */}
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="flex gap-2 items-start flex-1">
                          <span className="font-mono text-xs text-slate-600 flex-shrink-0 mt-0.5">Q{qi + 1}</span>
                          <p className="text-sm text-slate-200 leading-relaxed">{q.question}</p>
                        </div>
                        <span className={`font-mono text-xs font-bold flex-shrink-0 ${
                          isSkipped ? 'text-slate-500' :
                          isCorrect ? 'text-emerald-400' :
                          'text-red-400'
                        }`}>
                          {isSkipped ? '0' : isCorrect ? '+1.00' : '−0.25'}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5 mb-3">
                        {q.options.map((opt, oi) => {
                          const isCorrectOpt = oi === q.correct
                          const isUserOpt = oi === userAns
                          return (
                            <div
                              key={oi}
                              className={`px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
                                isCorrectOpt
                                  ? 'bg-emerald-500/12 text-emerald-300 border border-emerald-500/30'
                                  : isUserOpt && !isCorrectOpt
                                    ? 'bg-red-500/12 text-red-300 border border-red-500/30'
                                    : 'text-slate-600'
                              }`}
                            >
                              <span className="font-mono text-[10px] flex-shrink-0">
                                {String.fromCharCode(65 + oi)}.
                              </span>
                              <span className="flex-1">{opt.replace(/^[A-Da-d]\.\s*/, '')}</span>
                              {isCorrectOpt && <span className="text-emerald-400 flex-shrink-0">✓</span>}
                              {isUserOpt && !isCorrectOpt && <span className="text-red-400 flex-shrink-0">✗</span>}
                            </div>
                          )
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="bg-accent/5 border border-accent/15 rounded-lg px-3 py-2.5 text-xs text-slate-400 leading-relaxed">
                          <span className="text-accent font-semibold">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
