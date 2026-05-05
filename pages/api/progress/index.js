import { getAuthFromReq } from '../../../lib/auth'
import { getProgress, saveProgress } from '../../../lib/db'

export default function handler(req, res) {
  const user = getAuthFromReq(req)
  if (!user) return res.status(401).json({ error: 'Non authentifié' })

  if (req.method === 'GET') {
    return res.status(200).json({ progress: getProgress(user.id) })
  }

  if (req.method === 'POST') {
    const { xp, lessonsCompleted, quizzesCompleted } = req.body || {}
    saveProgress(user.id, { xp: xp || 0, lessonsCompleted: lessonsCompleted || [], quizzesCompleted: quizzesCompleted || [] })
    return res.status(200).json({ ok: true })
  }

  res.status(405).end()
}
