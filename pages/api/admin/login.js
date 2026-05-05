import { signAdminToken } from '../../../lib/auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'codelearn-admin-2024'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { password } = req.body || {}
  if (password !== ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Mot de passe incorrect.' })

  const token = signAdminToken()
  res.setHeader('Set-Cookie', `cl_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60*60*8}`)
  res.status(200).json({ ok: true })
}
