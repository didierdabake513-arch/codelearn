import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../../lib/useAuth'
import { useProgress, FREE_LIMIT } from '../../../lib/useProgress'
import { runTests, allPassed } from '../../../lib/testRunner'
import { toast } from '../../../components/Toast'
import AuthModal from '../../../components/AuthModal'
import LockWall from '../../../components/LockWall'
import styles from '../../../styles/Lecon.module.css'

// Minimal markdown renderer
function renderTheory(text) {
  if (!text) return ''
  let html = text
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Split on double newlines for paragraphs, but preserve pre blocks
  const parts = html.split(/\n\n+/)
  return parts.map(p => {
    if (p.startsWith('<pre>') || p.startsWith('<blockquote>')) return p
    if (p.startsWith('- ') || p.includes('\n- ')) {
      const items = p.split('\n').filter(l => l.startsWith('- ')).map(l => `<li>${l.slice(2)}</li>`).join('')
      return `<ul>${items}</ul>`
    }
    return `<p>${p}</p>`
  }).join('')
}

function buildPreviewDoc(source) {
  const raw = (source || '').trim()
  if (!raw) {
    return '<!DOCTYPE html><html><body style="background:#07070e;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><p style="color:#44426a;font-family:system-ui;font-size:13px">Clique sur Aperçu pour voir le résultat</p></body></html>'
  }
  const isHtmlDoc = /<html|<!doctype/i.test(raw)
  const looksLikeHtmlSnippet = /<\/?[a-z][\s\S]*>/i.test(raw)
  if (isHtmlDoc) return source
  if (looksLikeHtmlSnippet) {
    return `<!DOCTYPE html><html><head><style>body{margin:0;padding:16px;background:#07070e;color:#ececff;font-family:system-ui}</style></head><body>${source}</body></html>`
  }
  return `<!DOCTYPE html><html><head><style>body{margin:0;padding:16px;background:#07070e;color:#ececff;font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap}</style></head><body></body><script>${source}<\/script></html>`
}

export default function LeconPage() {
  const router = useRouter()
  const { courseId, lessonIdx: lessonIdxStr } = router.query
  const lessonIdx = parseInt(lessonIdxStr || '0')

  const { user, loading: authLoading } = useAuth()
  const { progress, loaded: progressLoaded, completeLesson, isLessonDone, isLocked } = useProgress(user)

  const [courseData, setCourseData] = useState(null)
  const [flatLessons, setFlatLessons] = useState([])
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  const [code, setCode] = useState('')
  const [previewSrc, setPreviewSrc] = useState('')
  const [activeTab, setActiveTab] = useState('code')
  const [testResults, setTestResults] = useState([])
  const [testing, setTesting] = useState(false)
  const [lessonPassed, setLessonPassed] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [quizOpen, setQuizOpen] = useState(false)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState([])
  const [quizDone, setQuizDone] = useState(false)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch course
  useEffect(() => {
    if (!courseId) return
    setLoading(true)
    fetch(`/api/courses?id=${courseId}`)
      .then(r => r.json())
      .then(d => {
        if (!d.course) { router.push('/cours'); return }
        const data = d.course
        setCourseData(data)
        const flat = []
        data.chapters.forEach(ch => {
          ch.lessons.forEach(l => flat.push({ ...l, flatIdx: flat.length }))
        })
        setFlatLessons(flat)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [courseId])

  // Set current lesson — always start with EMPTY editor
  useEffect(() => {
    if (!flatLessons.length) return
    const l = flatLessons[lessonIdx] || flatLessons[0]
    setLesson(l)
    setCode('')
    setPreviewSrc('')
    setTestResults([])
    setShowSuccess(false)
    setActiveTab('code')
  }, [flatLessons, lessonIdx])

  // Sync lessonPassed after progress loads
  useEffect(() => {
    if (progressLoaded && courseId !== undefined) {
      setLessonPassed(isLessonDone(courseId, lessonIdx))
    }
  }, [progressLoaded, progress, courseId, lessonIdx, isLessonDone])

  const firstNotDoneIdx = flatLessons.findIndex((_, idx) => !isLessonDone(courseId, idx))
  const normalizedFirstNotDoneIdx = firstNotDoneIdx === -1 ? flatLessons.length - 1 : firstNotDoneIdx
  const sequenceLocked = lessonIdx > normalizedFirstNotDoneIdx
  const freeLimitLocked = !user && isLocked && lessonIdx >= FREE_LIMIT
  const thisLessonLocked = sequenceLocked || freeLimitLocked

  useEffect(() => {
    if (!flatLessons.length || !courseId) return
    if (sequenceLocked) {
      router.replace(`/cours/${courseId}/${normalizedFirstNotDoneIdx}`)
    }
  }, [sequenceLocked, flatLessons.length, courseId, normalizedFirstNotDoneIdx, router])

  const handleTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.target
      const start = ta.selectionStart, end = ta.selectionEnd
      setCode(ta.value.substring(0, start) + '  ' + ta.value.substring(end))
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2 })
    }
  }

  const runPreview = useCallback(() => {
    setPreviewSrc(code)
    setActiveTab('result')
  }, [code])

  const runTestsNow = useCallback(async () => {
    if (!lesson?.tests?.length) return
    setTesting(true)
    setTestResults([])
    try {
      const results = await runTests(code, lesson.tests)
      setTestResults(results)
      const passed = allPassed(results)
      if (passed && !lessonPassed) {
        setLessonPassed(true)
        setShowSuccess(true)
        completeLesson(courseId, lessonIdx)
        toast('🎉 Leçon validée ! +10 XP', 'green')
      } else if (!passed) {
        const failCount = results.filter(r => !r.passed).length
        toast(`${failCount} test${failCount > 1 ? 's' : ''} échoue${failCount > 1 ? 'nt' : ''} — continue !`, 'red')
      }
    } catch {
      toast('Erreur lors des tests.', 'red')
    }
    setTesting(false)
  }, [code, lesson, lessonPassed, courseId, lessonIdx, completeLesson])

  const goToLesson = (idx) => {
    if (idx > normalizedFirstNotDoneIdx) {
      toast('Valide les leçons précédentes pour continuer.', 'red')
      return
    }
    setSidebarOpen(false)
    router.push(`/cours/${courseId}/${idx}`)
  }

  const goNext = () => {
    if (lessonIdx < flatLessons.length - 1) {
      router.push(`/cours/${courseId}/${lessonIdx + 1}`)
    } else {
      setQuizOpen(true)
    }
  }

  // Quiz
  const quizzes = courseData?.quizzes || []
  const currentQ = quizzes[quizStep]

  const answerQuiz = (optIdx) => {
    const correct = currentQ?.correct === optIdx
    const newAnswers = [...quizAnswers, { optIdx, correct, exp: currentQ.exp }]
    setQuizAnswers(newAnswers)
    if (quizStep >= quizzes.length - 1) {
      setTimeout(() => setQuizDone(true), 800)
    } else {
      setTimeout(() => setQuizStep(s => s + 1), 900)
    }
  }

  const closeQuiz = () => {
    setQuizOpen(false); setQuizStep(0); setQuizAnswers([]); setQuizDone(false)
  }

  const quizScore = quizAnswers.filter(a => a.correct).length

  // Loading state
  if (loading || authLoading || !progressLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px)' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    )
  }

  if (!lesson || !courseData) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Cours introuvable.</p>
        <Link href="/cours" className="btn btn-primary">Retour aux cours</Link>
      </div>
    )
  }

  // Build sidebar tree
  let fi = 0
  const tree = courseData.chapters.map(ch => ({
    ...ch,
    items: ch.lessons.map(l => { const idx = fi++; return { ...l, fi: idx } })
  }))

  const passedCount = testResults.filter(r => r.passed).length
  const totalTests = testResults.length

  return (
    <>
      <Head>
        <title>{lesson.title} — {courseData.name} — CodeLearn</title>
      </Head>

      <div className={styles.layout}>
        {/* TOP BAR */}
        <div className={styles.topbar}>
          <button className={styles.backBtn} onClick={() => router.push('/cours')}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            <span>Cours</span>
          </button>

          <div className={styles.breadcrumb}>
            <span style={{ color: 'var(--text3)' }}>{courseData.name}</span>
            <span style={{ color: 'var(--text3)', margin: '0 5px' }}>/</span>
            <span className={styles.breadcrumbCurrent}>{lesson.title}</span>
          </div>

          <div className={styles.topbarSpacer} />

          <div className={styles.topbarRight}>
            <span className={styles.lessonCount}>{lessonIdx + 1} / {flatLessons.length}</span>
            <div className={styles.xpBadge}>⚡ {progress.xp} XP</div>
            {quizzes.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={() => setQuizOpen(true)}>Quiz</button>
            )}
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {/* SIDEBAR */}
          <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHead}>
              <span className={styles.sidebarTitle}>{courseData.name}</span>
              <button className={styles.sidebarClose} onClick={() => setSidebarOpen(false)}>✕</button>
            </div>
            {tree.map((ch, ci) => (
              <div key={ci} className={styles.chapter}>
                <div className={styles.chapterTitle}>{ch.title}</div>
                {ch.items.map(item => {
                  const done = isLessonDone(courseId, item.fi)
                  const active = item.fi === lessonIdx
                  return (
                    <button
                      key={item.fi}
                      className={`${styles.lessonItem} ${done ? styles.done : ''} ${active ? styles.active : ''}`}
                      onClick={() => {
                        if (item.fi <= normalizedFirstNotDoneIdx) goToLesson(item.fi)
                      }}
                      disabled={item.fi > normalizedFirstNotDoneIdx}
                    >
                      <span className={styles.liIcon}>
                        {done ? '✓' : active ? '▶' : item.fi + 1}
                      </span>
                      <span className={styles.liText}>{item.title}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </aside>
          {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

          {/* CONTENT (theory + task) */}
          <div className={styles.content}>
            <div className={styles.theoryCard}>
              <div className={styles.theoryLabel}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Théorie
              </div>
              <div className="lesson-prose" dangerouslySetInnerHTML={{ __html: renderTheory(lesson.theory || '') }} />
            </div>

            <div className={styles.taskCard}>
              <div className={styles.taskLabel}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                Mission
              </div>
              <div className="lesson-prose" dangerouslySetInnerHTML={{ __html: renderTheory(lesson.task || '') }} />
            </div>

            {/* Tests — only ✓/✗ dots, no correction hints */}
            {testResults.length > 0 && (
              <div className={styles.testsRow}>
                {testResults.map((r, i) => (
                  <div
                    key={r.id || i}
                    className={`${styles.testDot} ${r.passed ? styles.pass : styles.fail}`}
                    aria-label={r.passed ? 'Test réussi' : 'Test échoué'}
                  >
                    {r.passed ? '✓' : '✗'}
                  </div>
                ))}
                <div className={`${styles.testsStatus} ${passedCount === totalTests ? styles.allPass : styles.someFail}`}>
                  {passedCount === totalTests
                    ? '✓ Tous les tests passent'
                    : `${passedCount} / ${totalTests} — continue`}
                </div>
              </div>
            )}

            {lessonPassed && !showSuccess && (
              <div className={styles.doneBar}>✓ Leçon déjà complétée</div>
            )}

            {showSuccess && (
              <div className={styles.successBanner}>
                <div className={styles.successEmoji}>🎉</div>
                <div>
                  <div className={styles.successTitle}>Bravo ! Leçon validée !</div>
                  <div className={styles.successSub}>+10 XP ajoutés</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={goNext} style={{ marginLeft: 'auto' }}>
                  {lessonIdx < flatLessons.length - 1 ? 'Leçon suivante →' : 'Terminer ✓'}
                </button>
              </div>
            )}

            <div className={styles.navBtns}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => router.push(`/cours/${courseId}/${lessonIdx - 1}`)}
                disabled={lessonIdx === 0}
              >
                ← Précédent
              </button>
              {lessonPassed && (
                <button className="btn btn-primary btn-sm" onClick={goNext}>
                  {lessonIdx < flatLessons.length - 1 ? 'Suivant →' : 'Terminer ✓'}
                </button>
              )}
            </div>
          </div>

          {/* EDITOR */}
          <div className={`${styles.editorPane} ${thisLessonLocked ? styles.editorLocked : ''}`}>
            {thisLessonLocked && <LockWall mode={sequenceLocked ? 'sequence' : 'freeLimit'} />}

            <div className={styles.editorTabs}>
              <button className={`${styles.tab} ${activeTab === 'code' ? styles.tabActive : ''}`} onClick={() => setActiveTab('code')}>Code</button>
              <button className={`${styles.tab} ${activeTab === 'result' ? styles.tabActive : ''}`} onClick={() => { setActiveTab('result'); setPreviewSrc(code) }}>Résultat</button>
              <div style={{ flex: 1 }} />
              <button className={styles.runBtn} onClick={runPreview}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Aperçu
              </button>
              <button
                className={styles.testBtn}
                onClick={runTestsNow}
                disabled={testing || thisLessonLocked}
              >
                {testing
                  ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> Test...</>
                  : '⚡ Valider'
                }
              </button>
              <button
                className={styles.resetBtn}
                onClick={() => { setCode(''); setTestResults([]) }}
                title="Réinitialiser"
              >↺</button>
            </div>

            {/* Code */}
            <div className={styles.editorWrap} style={{ display: activeTab === 'code' ? 'flex' : 'none' }}>
              <div className={styles.lineNums}>
                {code.split('\n').map((_, i) => <span key={i}>{i + 1}</span>)}
              </div>
              <textarea
                className={styles.codeArea}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleTab}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                disabled={thisLessonLocked}
              />
            </div>

            {/* Preview — dark-themed wrapper, white iframe content */}
            <div className={styles.previewWrap} style={{ display: activeTab === 'result' ? 'flex' : 'none' }}>
              <div className={styles.previewHeader}>
                <div className={styles.previewDot} />
                <span>Aperçu</span>
              </div>
              <iframe
                className={styles.previewFrame}
                srcDoc={buildPreviewDoc(previewSrc)}
                sandbox="allow-scripts"
                title="preview"
              />
            </div>
          </div>
        </div>
      </div>

      {/* QUIZ MODAL */}
      {quizOpen && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) closeQuiz() }}>
          <div className="modal">
            <button className="modal-close" onClick={closeQuiz}>✕</button>
            {!quizDone ? (
              <>
                <div className="modal-title">Quiz — {courseData.name}</div>
                <div className="modal-sub">Question {quizStep + 1} / {quizzes.length}</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                  {quizzes.map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 99,
                      background: i < quizStep ? 'var(--green)' : i === quizStep ? 'var(--accent)' : 'var(--bg4)',
                      transition: 'background .3s'
                    }} />
                  ))}
                </div>
                {currentQ && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 18, lineHeight: 1.5 }}>{currentQ.q}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      {currentQ.opts.map((opt, i) => {
                        const answered = quizAnswers.length > quizStep
                        const chosen = answered && quizAnswers[quizStep]?.optIdx === i
                        const isCorrect = i === currentQ.correct
                        let bg = 'var(--bg3)', border = 'var(--border2)', color = 'var(--text2)'
                        if (answered) {
                          if (isCorrect) { bg = 'var(--green-bg)'; border = 'var(--green)'; color = 'var(--green)' }
                          else if (chosen) { bg = 'var(--red-bg)'; border = 'var(--red)'; color = 'var(--red)' }
                        }
                        return (
                          <button key={i} onClick={() => { if (!answered) answerQuiz(i) }}
                            style={{ padding: '12px 16px', borderRadius: 10, border: `1px solid ${border}`, background: bg, cursor: answered ? 'default' : 'pointer', fontSize: 14, color, textAlign: 'left', fontFamily: 'var(--font)', width: '100%', transition: 'all .15s' }}
                          >{opt}</button>
                        )
                      })}
                    </div>
                    {quizAnswers[quizStep] && (
                      <div style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13, lineHeight: 1.6, background: quizAnswers[quizStep].correct ? 'var(--green-bg)' : 'var(--red-bg)', color: quizAnswers[quizStep].correct ? 'var(--green)' : 'var(--red)' }}>
                        {quizAnswers[quizStep].correct ? '✓ Correct ! ' : '✗ '}{currentQ.exp}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>{quizScore >= Math.ceil(quizzes.length * 0.6) ? '🎉' : '📚'}</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  {quizScore} / {quizzes.length} bonnes réponses
                </div>
                <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 }}>
                  {quizScore >= Math.ceil(quizzes.length * 0.6) ? 'Excellent travail !' : 'Continue à pratiquer !'}
                </div>
                {quizScore >= Math.ceil(quizzes.length * 0.6) && (
                  <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', background: 'var(--amber-bg)', border: '1px solid rgba(255,184,48,.2)', color: 'var(--amber)', fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, padding: '12px 24px', borderRadius: 99, marginBottom: 24 }}>⚡ +50 XP</div>
                )}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button className="btn btn-ghost btn-sm" onClick={closeQuiz}>Fermer</button>
                  <Link href="/cours" className="btn btn-primary btn-sm" onClick={closeQuiz}>Voir les cours</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
