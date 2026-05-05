import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../../lib/useAuth'
import { FREE_LIMIT } from '../../../lib/useProgress'

const LOCAL_PROGRESS_KEY = 'cl_progress_guest'

export default function CourseRoot() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { courseId } = router.query

  useEffect(() => {
    if (!courseId || loading) return

    let cancelled = false

    const resumeAtBestLesson = async () => {
      let completed = []
      let totalLessons = 0

      try {
        const courseRes = await fetch(`/api/courses?id=${courseId}`)
        if (courseRes.ok) {
          const courseData = await courseRes.json()
          const course = courseData?.course
          totalLessons = (course?.chapters || []).reduce((acc, ch) => acc + (ch?.lessons || []).length, 0)
        }
      } catch {}

      try {
        if (user) {
          const progressRes = await fetch('/api/progress')
          if (progressRes.ok) {
            const progressData = await progressRes.json()
            completed = progressData?.progress?.lessonsCompleted || []
          }
        } else {
          const raw = localStorage.getItem(LOCAL_PROGRESS_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            completed = parsed?.lessonsCompleted || []
          }
        }
      } catch {}

      const doneSet = new Set(completed)
      let targetIdx = 0
      if (totalLessons > 0) {
        for (let i = 0; i < totalLessons; i++) {
          if (!doneSet.has(`${courseId}-${i}`)) {
            targetIdx = i
            break
          }
          targetIdx = i
        }
      }
      if (!user && targetIdx >= FREE_LIMIT) targetIdx = FREE_LIMIT - 1

      if (!cancelled) router.replace(`/cours/${courseId}/${targetIdx}`)
    }

    resumeAtBestLesson()
    return () => { cancelled = true }
  }, [courseId, loading, router, user])

  return null
}
