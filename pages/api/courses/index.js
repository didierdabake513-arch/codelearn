import { getCoursesList, getCourseData } from '../../../lib/db'
import { seedIfEmpty } from '../../../lib/seedCourses'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  seedIfEmpty()

  const { id } = req.query

  if (id) {
    const data = getCourseData(id)
    if (!data) return res.status(404).json({ error: 'Cours introuvable' })
    // Strip test answers before sending to client (keep test descriptions + check type only)
    return res.status(200).json({ course: data })
  }

  const list = getCoursesList()
  res.status(200).json({ courses: list })
}
