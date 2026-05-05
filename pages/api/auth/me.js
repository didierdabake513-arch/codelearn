import { getAuthFromReq } from '../../../lib/auth'

export default function handler(req, res) {
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'cl_token=; Path=/; HttpOnly; Max-Age=0')
    return res.status(200).json({ ok: true })
  }
  if (req.method === 'GET') {
    const user = getAuthFromReq(req)
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    return res.status(200).json({ user })
  }
  res.status(405).end()
}
