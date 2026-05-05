import { useState, useEffect, useCallback } from 'react'

const LOCAL_KEY = 'cl_progress_guest'
const FREE_LIMIT = 5

const defaultState = { xp: 0, lessonsCompleted: [], quizzesCompleted: [] }

export { FREE_LIMIT }

export function useProgress(user) {
  const [progress, setProgress] = useState(defaultState)
  const [loaded, setLoaded] = useState(false)

  // Load: from server if logged in, localStorage if guest
  useEffect(() => {
    if (user === undefined) return // still loading auth
    const load = async () => {
      if (user) {
        try {
          const r = await fetch('/api/progress')
          if (r.ok) { const d = await r.json(); setProgress(d.progress || defaultState) }
        } catch {}
      } else {
        try {
          const saved = localStorage.getItem(LOCAL_KEY)
          if (saved) setProgress(JSON.parse(saved))
        } catch {}
      }
      setLoaded(true)
    }
    load()
  }, [user])

  const save = useCallback(async (next) => {
    setProgress(next)
    if (user) {
      try {
        await fetch('/api/progress', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next)
        })
      } catch {}
    } else {
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)) } catch {}
    }
  }, [user])

  const completeLesson = useCallback(async (courseId, lessonFlatIdx) => {
    const key = `${courseId}-${lessonFlatIdx}`
    setProgress(prev => {
      if (prev.lessonsCompleted.includes(key)) return prev
      const next = { ...prev, xp: prev.xp + 10, lessonsCompleted: [...prev.lessonsCompleted, key] }
      if (user) {
        fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(() => {})
      } else {
        try { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)) } catch {}
      }
      return next
    })
  }, [user])

  const completeQuiz = useCallback(async (courseId) => {
    setProgress(prev => {
      if (prev.quizzesCompleted.includes(courseId)) return prev
      const next = { ...prev, xp: prev.xp + 50, quizzesCompleted: [...prev.quizzesCompleted, courseId] }
      if (user) {
        fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(() => {})
      } else {
        try { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)) } catch {}
      }
      return next
    })
  }, [user])

  const isLessonDone = useCallback((courseId, idx) => {
    return progress.lessonsCompleted.includes(`${courseId}-${idx}`)
  }, [progress])

  // Is user locked (guest + over free limit)?
  const totalDone = progress.lessonsCompleted.length
  const isLocked = !user && totalDone >= FREE_LIMIT

  // Migrate guest progress to server after login
  const migrateGuestProgress = useCallback(async () => {
    if (!user) return
    try {
      const saved = localStorage.getItem(LOCAL_KEY)
      if (!saved) return
      const guestProg = JSON.parse(saved)
      // Merge: keep highest XP
      const r = await fetch('/api/progress')
      if (r.ok) {
        const { progress: serverProg } = await r.json()
        const merged = {
          xp: Math.max(guestProg.xp || 0, serverProg.xp || 0),
          lessonsCompleted: [...new Set([...(guestProg.lessonsCompleted || []), ...(serverProg.lessonsCompleted || [])])],
          quizzesCompleted: [...new Set([...(guestProg.quizzesCompleted || []), ...(serverProg.quizzesCompleted || [])])],
        }
        await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged) })
        setProgress(merged)
        localStorage.removeItem(LOCAL_KEY)
      }
    } catch {}
  }, [user])

  return { progress, loaded, completeLesson, completeQuiz, isLessonDone, isLocked, migrateGuestProgress }
}
