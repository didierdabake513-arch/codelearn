import { getAdminFromReq } from '../../../lib/auth'
import { getCoursesList, getCourseData, saveCourse, deleteCourse } from '../../../lib/db'

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

export default function handler(req, res) {
  const admin = getAdminFromReq(req)
  if (!admin) return res.status(401).json({ error: 'Accès refusé.' })

  // GET: list all courses with full data
  if (req.method === 'GET') {
    const list = getCoursesList()
    return res.status(200).json({ courses: list })
  }

  // POST: upload a course (JSON body = course data)
  if (req.method === 'POST') {
    const course = req.body
    if (!course?.id || !course?.name || !course?.chapters)
      return res.status(400).json({ error: 'Données de cours invalides. Requis: id, name, chapters.' })

    // Validate structure
    for (const ch of course.chapters || []) {
      for (const lesson of ch.lessons || []) {
        if (!lesson.title || !lesson.task || !lesson.starterCode)
          return res.status(400).json({ error: `Leçon "${lesson.title || '?'}" manque: title, task ou starterCode.` })
        if (!Array.isArray(lesson.tests) || lesson.tests.length === 0)
          return res.status(400).json({ error: `Leçon "${lesson.title}" n'a pas de tests.` })
      }
    }

    saveCourse(course)
    return res.status(201).json({ ok: true, id: course.id })
  }

  // DELETE: remove a course
  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id manquant.' })
    deleteCourse(id)
    return res.status(200).json({ ok: true })
  }

  res.status(405).end()
}
